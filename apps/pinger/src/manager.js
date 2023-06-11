const { Monitor, MonitorCheck, Model } = require('db');
const {
	HTTPMonitor,
	TCPMonitor,
	HeartbeatMonitor,
	NoopMonitor
} = require('./monitors');
const { Incident } = require('./incidents/incident');

const MONITOR_TYPES = {
	'http': HTTPMonitor,
	// 'tcp': TCPMonitor,
	'heartbeat': HeartbeatMonitor,
	'noop': NoopMonitor
};

class MonitorManager {
	filter_active(monitors=[]) {
		const now = Date.now();
		return monitors.filter(monitor => {
			if(!monitor.last_check_time) {
				// Never checked
				return true;
			}

			const last_check = new Date(monitor.last_check_time);
			const delta = now - last_check.getTime();
			return delta >= monitor.interval_ms;
		});
	}

	run() {
		// gets monitors in
		// returns monitors to save out + data
		return Monitor.all().then(monitors => {
			if(!monitors?.length) {
				return;
			}

			const active_monitors = this.filter_active(monitors);
			const instanciated_monitors = active_monitors.map(monitor => {
				const MonitorClass = MONITOR_TYPES[monitor.type];
				try {
					return new MonitorClass(monitor);
				} catch(e) {
					// TODO: sentry
					console.error(`Error instanciating monitor ${monitor.name}`);
					console.error(e);
					return null;
				}
			}).filter(m => m);

			const runs = instanciated_monitors.map(monitor => monitor.test());

			return Promise.all(runs);
		}).then(monitor_runs => {
			// Maybe no monitors are enabled to run right now
			if(!monitor_runs?.length) {
				return;
			};

			const failed_checks = monitor_runs.filter(({ up }) => !up);

			// Bulk insert monitor runs
			const monitor_checks = monitor_runs.map(run => {
				const { id: monitor_id, date, up, result, error, ping } = run;
				return new MonitorCheck({
					monitor_id,
					up,
					result,
					error: error?.message || null,
					ping,
					date: new Date(date).getTime()
				});
			});

			// Insert check runs
			const bulk_inserts_promise = MonitorCheck.bulk_insert(monitor_checks);

			const updated_monitors_dates = monitor_runs.map(run => {
				const { id: monitor_id, last_check_time } = run;
				const date_ms = new Date(last_check_time).getTime();

				const query = 'UPDATE monitor SET m_last_check_time = ? WHERE m_id = ?';
				return Monitor.db().prepare(query).bind(date_ms, monitor_id);
			});

			// Update monitor dates
			// TODO: both this and the incident creation should be in a transaction
			const update_monitors_promise = Monitor.db().batch(updated_monitors_dates);

			// Create incidents
			const maybe_incidents_promise = Incident.compute_incidents(failed_checks);

			return Promise.all([
				bulk_inserts_promise,
				update_monitors_promise,
				maybe_incidents_promise
			]);
		});
	}
}

const manager = new MonitorManager();
module.exports = {
	manager,
	MonitorManager
}
