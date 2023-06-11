const Monitor = require('./monitor');

class Heartbeat {
	constructor({ date }) {
		this.date = date;
	}
}

class HeartbeatMonitor extends Monitor {
	constructor({ heartbeats=[], ...config }) {
		super(config);
		this.heartbeats = heartbeats;
	}

	run() {
		// Check if last heartbeat matches the interval
		// Setup some leeway
		const sorted_hbts = this.heartbeats.sort((a, b) => {
			return new Date(a.date) - new Date(b.date);
		});

		const [last_heartbeat, previous_heartbeat] = sorted_hbts;

		const now = new Date();
		const delta_now = now - new Date(last_heartbeat.date);
		const last_delta = new Date(last_heartbeat.date) - new Date(previous_heartbeat.date);
		if(delta_now > this.interval_in_ms || last_delta > this.interval_in_ms) {
			throw new Error('Missed heartbeat');
		}
	}
}

module.exports = HeartbeatMonitor;
