const { Model } = require('./model');

class AggregatedPerformancePoint extends Model {
	static instanciate({
		pp_tracker_id,
		agg_date,
		agg_value
	}) {
		return new this({
			agg_date,
			agg_value,
			tracker_id: pp_tracker_id,
		});
	}
}

class PerformanceTracker extends Model {
	static TABLE = 'performance_tracker';

	static instanciate({ pt_id, pt_name, pt_description }) {
		return new this({
			id: pt_id,
			name: pt_name,
			description: pt_description,
			points: []
		});
	}

	static insert({ id, name, description=null, page_hosts = [] }) {
		const query = `
			INSERT INTO ${this.TABLE} (
				pt_id,
				pt_name,
				pt_description
			)
			VALUES (?, ?, ?)
		`;

		if(!page_hosts?.length) {
			return this.run(query, id, name, description);
		}

		const tracker_query = this.prepare(query, id, name, description);
		const p2t_values = new Array(page_hosts.length).fill('(?, ?)').join(', ');
		const p2t_bindings = page_hosts.map(host => [host, id]).flat();
		const p2t_query = `INSERT INTO page_performance_tracker_m2m (page_host, pt_id) VALUES ${p2t_values}`;

		const pages = this.prepare(p2t_query, ...p2t_bindings);
		return this.batch([ tracker_query, pages ]);
	}

	static add_points(points=[]) {
		const values_placeholders = new Array(points.length).fill('(?, ?, ?, ?)').join(', ');
		const query = `
			INSERT INTO performance_point (
				pp_tracker_id,
				pp_date_ms,
				pp_value,
				pp_region
			)
			VALUES ${values_placeholders};
		`;

		const bindings = points.map((point) => {
			const { tracker_id, date_ms, value, region=null } = point;
			if(!tracker_id || date_ms === undefined || date_ms === null || value === undefined) {
				throw new Error('Data point must include tracker_id, date_ms and value');
			}

			return [tracker_id, date_ms, value, region];
		}).flat();

		return this.raw(query, ...bindings).then(({ success }) => {
			if(!success) {
				throw new Error('Could not insert data points');
			}
		});
	}

	static for_page({ host, from_date_ms, aggregate_min=15 }) {
		/*
			We can aggregate to the "lower" X minutes by subtracting the modulo from the date
			Happy to say that this was my own finding and not ChatGPT
			SELECT
				strftime('%Y-%m-%dT%H:%M:%fZ', (1688285091114 / 1000) - (1688285091114 / 1000) % 600, 'unixepoch') as date_min4,
				strftime('%Y-%m-%dT%H:%M:%fZ', (1688285534886 / 1000) - (1688285534886 / 1000) % 600, 'unixepoch') as date_min12,
				strftime('%Y-%m-%dT%H:%M:%fZ', (1688286254886 / 1000) - (1688286254886 / 1000) % 600, 'unixepoch') as date_min24,
				strftime('%Y-%m-%dT%H:%M:%fZ', (1688286614886 / 1000) - (1688286614886 / 1000) % 600, 'unixepoch') as date_min30,

				strftime('%Y-%m-%dT%H:%M:%fZ', (1688285091114 / 1000) - (1688285091114 / 1000) % 300, 'unixepoch') as date_5m_min4,
				strftime('%Y-%m-%dT%H:%M:%fZ', (1688285534886 / 1000) - (1688285534886 / 1000) % 300, 'unixepoch') as date_5m_min12,
				strftime('%Y-%m-%dT%H:%M:%fZ', (1688286254886 / 1000) - (1688286254886 / 1000) % 300, 'unixepoch') as date_5m_min24,
				strftime('%Y-%m-%dT%H:%M:%fZ', (1688286374886 / 1000) - (1688286374886 / 1000) % 300, 'unixepoch') as date_5m_min26,
				strftime('%Y-%m-%dT%H:%M:%fZ', (1688286614886 / 1000) - (1688286614886 / 1000) % 300, 'unixepoch') as date_5m_min30
			;
			{
				"date_min4": "2023-07-02T08:00:00.000Z",
				"date_min12": "2023-07-02T08:10:00.000Z",
				"date_min24": "2023-07-02T08:20:00.000Z",
				"date_min30": "2023-07-02T08:30:00.000Z",
				"date_5m_min4": "2023-07-02T08:00:00.000Z",
				"date_5m_min12": "2023-07-02T08:10:00.000Z",
				"date_5m_min24": "2023-07-02T08:20:00.000Z",
				"date_5m_min26": "2023-07-02T08:25:00.000Z",
				"date_5m_min30": "2023-07-02T08:30:00.000Z"
			}
		*/

		const aggregate_secs = aggregate_min * 60;

		const performance_query = `
			SELECT
				pp.pp_tracker_id,
				pt.*,
				strftime('%Y-%m-%dT%H:%M:%fZ', (pp.pp_date_ms / 1000) - (pp.pp_date_ms / 1000) % ?, 'unixepoch') as agg_date,
				avg(pp.pp_value) as agg_value
			FROM performance_point pp
				RIGHT JOIN performance_tracker pt ON pt.pt_id = pp.pp_tracker_id
			 	JOIN page_performance_tracker_m2m p2t ON p2t.pt_id = pp.pp_tracker_id
			WHERE p2t.page_host = ?
			AND pp.pp_date_ms >= ?
			GROUP BY pp.pp_tracker_id, agg_date
		`;

		// columns: pt_id, pt_name, pt_description, pp_tracker_id
		return this.raw(performance_query, aggregate_secs, host, from_date_ms).then(({ success, results }) => {
			if(!success) {
				throw new Error('Could not aggregate performance points for page');
			}

			const trackers_with_points = results.reduce((agg, row) => {
				const point = AggregatedPerformancePoint.instanciate(row);
				agg[point.tracker_id] = agg[point.tracker_id] || PerformanceTracker.instanciate(row);

				agg[point.tracker_id].points.push(point);
				return agg;
			}, {});

			Object.values(trackers_with_points).forEach(({ points }) => {
				// mutate points
				points.sort((a, b) => new Date(a.agg_date) - new Date(b.agg_date));
			})

			return trackers_with_points;
		});
	}
}

module.exports = { PerformanceTracker };
