const { Model } = require('./model');

class MonitorCheck extends Model {
	static TABLE = 'monitor_check';

	constructor({ monitor_id, up, result, date, ping, error, region=null }) {
		super();
		this.monitor_id = monitor_id;
		this.up = up;
		this.result = result;
		this.date = date;
		this.ping = ping;
		this.error = error;
		this.region = region;
	}

	static instanciate({ mc_monitor_id, mc_up, mc_result, mc_date_ms, mc_ping_ms, mc_error, mc_region }) {
		return new this({
			up: Boolean(mc_up),
			error: mc_error,
			result: JSON.parse(mc_result || 'null'),
			monitor_id: mc_monitor_id,
			date: new Date(mc_date_ms),
			ping: mc_ping_ms,
			region: mc_region
		});
	}

	static get_insert_arg_list(instance) {
		const { monitor_id, up, result, date, ping, error, region } = instance;
		const result_cast = (result instanceof Object ? JSON.stringify(result) : result) || null;
		return [
			monitor_id,
			up ? 1 : 0,
			result_cast,
			new Date(date).getTime(),
			ping || null,
			error || null,
			region || null
		];
	}

	static insert(monitor_check) {
		return this.bulk_insert([monitor_check]);
	}

	static bulk_insert(monitor_checks) {
		const values_placeholders = new Array(monitor_checks.length).fill('(?, ?, ?, ?, ?, ?, ?)').join(', ');

		const query = `
			INSERT INTO monitor_check (
				mc_monitor_id,
				mc_up,
				mc_result,
				mc_date_ms,
				mc_ping_ms,
				mc_error,
				mc_region
			) VALUES ${values_placeholders};
		`;

		const args = monitor_checks.map(instance => this.get_insert_arg_list(instance)).flat();
		return this.run(query, ...args);
	}
}

class AggregatedMonitorCheck extends Model {
	constructor({ monitor_id, up, result, date, ping, error, agg_up, agg_date, agg_ping }) {
		super();
		this.monitor_id = monitor_id;
		this.agg_up = agg_up;
		this.agg_date = agg_date;
		this.agg_ping = agg_ping;
	}

	static instanciate({ mc_monitor_id, agg_up, agg_date, agg_ping }) {
		return new this({
			monitor_id: mc_monitor_id,
			agg_up,
			agg_date,
			agg_ping
		});
	}

}
module.exports = { MonitorCheck, AggregatedMonitorCheck };
