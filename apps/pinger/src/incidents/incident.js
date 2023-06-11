const { Monitor, MonitorCheck, Incident: IncidentModel } = require('db');

class Incident {
	static compute_incidents(failed_runs=[]) {
		if(!failed_runs?.length) {
			return Promise.resolve();
		}

		const monitor_ids = failed_runs.map(({ id }) => id);
		const ids_bindings = monitor_ids.map((id) => `?`).join(', ');

		const monitor_query = Monitor.prepare(`SELECT m.* FROM monitor m WHERE m.m_id IN (${ids_bindings})`, ...monitor_ids);
		const checks_query = MonitorCheck.prepare(`
			SELECT mc.* FROM monitor_check mc
			WHERE mc.mc_monitor_id IN (${ids_bindings})
			ORDER BY mc.mc_date_ms DESC
			LIMIT 30;
		`, ...monitor_ids);

		return Monitor.db().batch([monitor_query, checks_query]).then((results) => {
			// Each result is a { results, success } object
			const [{ results: raw_monitors }, { results: raw_monitor_checks }] = results;

			const monitor_checks = raw_monitor_checks.map(raw_check => MonitorCheck.instanciate(raw_check));

			const checks_by_monitor_id = monitor_checks.reduce((agg, check) => {
				agg[check.monitor_id] = agg[check.monitor_id] || [];
				agg[check.monitor_id].push(check);
				return agg;
			}, {});

			// Check for new incidents
			const new_incidents = [];
			for(const raw_monitor of raw_monitors) {
				const monitor = Monitor.instanciate(raw_monitor);
				const { consecutive_failed_checks_incident } = monitor;

				const monitor_checks = checks_by_monitor_id[monitor.id] || [];
				const checks = monitor_checks.sort((ca, cb) => {
					return new Date(cb.date) - new Date(ca.date);
				});

				const last_checks = checks.slice(-consecutive_failed_checks_incident);
				const last_checks_plus_one = checks.slice(-(consecutive_failed_checks_incident + 1)); 

				const all_failed = last_checks.every(check => !check.up);
				const all_failed_plus_one = last_checks_plus_one.every(check => !check.up);

				// if all_failed_plus_one we can assume the incident has already been created
				const incident_already_created = all_failed_plus_one && last_checks_plus_one.length === consecutive_failed_checks_incident + 1;

				// We check length because all checks might be smaller than necessary
				// (for example, when we first setup the project)
				if(!incident_already_created && all_failed && last_checks.length === consecutive_failed_checks_incident) {
					// creates incident
					new_incidents.push({
						monitor_id: monitor.id,
						from_ms: Date.now(),
						title: `Automatic Monitoring Incident${monitor.name ? ` on ${monitor.name}` : ''}`
					});
				}
			}

			// TODO: autoresolve incidents?
			if(!new_incidents.length) {
				return;
			}

			const values = new_incidents.map(({ monitor_id, from_ms, title }) => {
				return `(?, ?, NULL, ?, '')`;
			}).join(',\n');

			const flattened_incidents = new_incidents.map(({ monitor_id, from_ms, title }) => [monitor_id, from_ms, title]).flat();

			return IncidentModel.run(`
				INSERT INTO incident (
					i_monitor_id,
					i_from_ms,
					i_to_ms,
					i_title,
					i_description
				) VALUES ${values};
			`, ...flattened_incidents);
		});
	}
}

module.exports = {
	Incident
};
