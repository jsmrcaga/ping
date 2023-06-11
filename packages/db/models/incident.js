const { Model } = require('./model');
const { Monitor } = require('./monitor');
const { MonitorCheck } = require('./monitor-check');

class IncidentUpdate extends Model {
	static instanciate({ iu_incident_id, iu_date_ms, iu_title, iu_description }) {
		return new this({
			incident_id: iu_incident_id,
			date: iu_date_ms,
			title: iu_title,
			description: iu_description
		});
	}
}

class Incident extends Model {
	static TABLE = 'incident';

	constructor(...args) {
		super(...args);
		this.updates = [];
	}

	static all() {
		return this.query('SELECT * FROM incident');
	}

	static with_updates({ incident_id }) {
		const incident_query = this.raw(`
			SELECT i.*, m.* FROM incident i
			JOIN monitor m
				ON m.m_id = i.i_monitor_id
			WHERE i.i_id = ?
		`, incident_id);

		const updates_query = IncidentUpdate.query(`
			SELECT iu.* FROM incident_update iu
			WHERE iu.iu_incident_id = ?
		`, incident_id);

		return Promise.all([incident_query, updates_query]).then(([{ results: raw_incidents }, updates]) => {
			const incidents_by_id = raw_incidents.reduce((agg, raw_incident) => {
				// The same row contains all values because of the join
				const incident = this.instanciate(raw_incident);
				const monitor = Monitor.instanciate(raw_incident);
				incident.monitor = monitor;
				
				agg[incident.id] = incident;
				return agg;
			}, {});

			for(const update of updates) {
				incidents_by_id[update.incident_id].updates.push(update);
			}

			const incidents_w_updates = Object.values(incidents_by_id);
			incidents_w_updates.forEach(incident => {
				incident.updates = incident.updates.sort((u1, u2) => {
					return new Date(u2.date) - new Date(u1.date);
				});
			});

			return incidents_w_updates[0];
		});
	}

	static for_page({ host, unresolved=true }) {
		const query = `
			SELECT i.* FROM incident i
			JOIN page_monitor_m2m pm ON
				pm.monitor_id = i.i_monitor_id
			WHERE pm.page_host = ?
			${unresolved ? `AND i.i_to_ms IS NULL` : ''}
			LIMIT 15
		`;
		return this.query(query, host);
	}

	static insert({
		id,
		monitor_id,
		from,
		to=NULL,
		title='',
		description='',
		is_maintenance=false,
		expected_duration=null,
	}) {
		const query = `
			INSERT INTO incident (
				i_id,
				i_monitor_id,
				i_from_ms,
				i_to_ms,
				i_title,
				i_description,
				i_is_maintenance,
				i_expected_duration_ms,
			)

			VALUES (
				?,
				?,
				?,
				?,
				?,
				?,
				?,
				?,
			)
		`;

		return this.run(query, id, monitor_id, from, to, title, description, is_maintenance, expected_duration);
	}

	static instanciate({ 
		i_id,
		i_monitor_id,
		i_from_ms,
		i_to_ms,
		i_title,
		i_description,
		i_is_maintenance,
		i_expected_duration_ms,
	}) {
		return new this({
			id: i_id,
			monitor_id: i_monitor_id,
			from: new Date(i_from_ms),
			to: i_to_ms ? new Date(i_to_ms) : i_to_ms,
			title: i_title,
			description: i_description,
			is_maintenance: Boolean(i_is_maintenance),
			expected_duration: i_expected_duration_ms
		});
	}
}

module.exports = { Incident };
