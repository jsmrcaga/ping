const { Model } = require('./model');

class Monitor extends Model {
	static TABLE = 'monitor';

	constructor({ id, type, name, interval_ms, last_check_time, config, consecutive_failed_checks_incident }) {
		super();
		this.id = id;
		this.type = type;
		this.name = name;
		this.config = config;
		this.interval_ms = interval_ms;
		this.last_check_time = last_check_time;
		this.consecutive_failed_checks_incident = consecutive_failed_checks_incident;

		// This is not on DB
		// It will be built from MonitorChecks
		this.checks = [];
	}

	static all() {
		return this.query('SELECT * FROM monitor');
	}

	static for_page({ host }) {
		const query = `
			SELECT m.* FROM monitor m
			JOIN page_monitor_m2m pm ON
				pm.monitor_id = m.m_id
			WHERE pm.page_host = ?
			LIMIT 15
		`;
		return this.query(query, host);
	}

	static insert({ id, type, name, config, interval_ms, consecutive_failed_checks_incident }) {
		const query = `
			INSERT INTO monitor (m_id, m_type, m_name, m_config_json, m_interval_ms, m_consecutive_failed_checks_incident)
			VALUES (
				?,
				?,
				?,
				?,
				?,
				?
			);
		`;

		return this.run(query, id, type, name, JSON.stringify(config), interval_ms, consecutive_failed_checks_incident || 3);
	}

	static instanciate({
		m_id,
		m_type,
		m_name,
		m_config_json,
		m_last_check_time,
		m_interval_ms,
		m_consecutive_failed_checks_incident = 3
	}) {
		return new this({
			id: m_id,
			type: m_type,
			name: m_name,
			last_check_time: m_last_check_time,
			interval_ms: m_interval_ms,
			config: JSON.parse(m_config_json),
			consecutive_failed_checks_incident: m_consecutive_failed_checks_incident
		});
	}
}

module.exports = { Monitor };
