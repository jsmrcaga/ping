const { Model } = require('./model');

const { Monitor } = require('./monitor');
const { MonitorCheck } = require('./monitor-check');
const { AggregatedMonitorCheck } = require('./monitor-check');

const MONTH_IN_MS = 1000 * 60 * 60 * 24 * 31;

class Page extends Model {
	static TABLE = 'page';

	constructor({ host, monitors, title, sections }) {
		super();
		this.host = host;
		this.title = title;
		this.sections = sections;

		// Not on DB, filled up later
		this.monitors = [];
	}

	static with_monitors({ host, from_date=Date.now() - (MONTH_IN_MS * 3) }) {
		const date_ms = new Date(from_date).getTime();

		const page_query = 'SELECT * FROM page WHERE page.p_host = ?';
		const page_promise = this.get(page_query, host);

		// We don't request the page info to prevent useless data from circulating
		// the network. We could also split this query to prevent monitor data
		// But it is smaller than the sections data on pages

		// Interesting side-effect, if there are no mc rows
		// this query returns nothing, maybe fixable with a RIGHT JOIN on monitors
				// JOIN page p ON p.p_host = pm.page_host
		const checks_query = `
			SELECT
				mc.mc_monitor_id,
				m.*,
				strftime('%Y-%m-%d', mc.mc_date_ms / 1000, 'unixepoch') as agg_date,
				avg(mc.mc_up) as agg_up,
				round(avg(mc.mc_ping_ms)) as agg_ping
			FROM monitor_check mc
				RIGHT JOIN monitor m ON mc.mc_monitor_id = m.m_id
				JOIN page_monitor_m2m pm ON pm.monitor_id = m.m_id
			WHERE pm.page_host = ?
			AND mc.mc_date_ms >= ?
			GROUP BY m.m_id, agg_date
		`;

		// JOIN clause proudly presented by ChatGPT
		const last_checks_query = `
			SELECT mc.*, pm.* FROM monitor_check mc
				JOIN (
					SELECT mc2.mc_monitor_id, MAX(mc2.mc_date_ms) AS max_date
					FROM monitor_check mc2
					GROUP BY mc2.mc_monitor_id
				) AS latest_check
					ON latest_check.mc_monitor_id = mc.mc_monitor_id AND latest_check.max_date = mc.mc_date_ms

				JOIN page_monitor_m2m pm
					ON pm.monitor_id = mc.mc_monitor_id
			WHERE pm.page_host = ?
		`;
		const last_checks_promise = MonitorCheck.query(last_checks_query, host);

		const monitors_promise = this.raw(checks_query, host, date_ms.toString()).then(({ success, results }) => {
			if(!success) {
				throw new Error('Could not get monitors for page');
			}

			const monitors_with_checks = results.reduce((agg, row) => {
				const check = AggregatedMonitorCheck.instanciate(row);
				agg[check.monitor_id] = agg[check.monitor_id] || Monitor.instanciate(row);

				// Our current monitor
				agg[check.monitor_id].checks.push(check);
				return agg;
			}, {});

			Object.values(monitors_with_checks).forEach(monitor => {
				monitor.checks.sort((checkA, checkB) => {
					return new Date(checkA) - new Date(checkB);
				});
			});

			return monitors_with_checks;
		});

		return Promise.all([page_promise, monitors_promise, last_checks_promise]).then(([page, monitors, last_checks]) => {
			page.monitors = monitors;
			page.from = new Date(from_date).toISOString();
			page.to = new Date().toISOString();


			// Put last checks into monitors
			for(const lc of last_checks) {
				page.monitors[lc.monitor_id].last_check = lc;
				page.monitors[lc.monitor_id].currently_up = Boolean(lc.up);
			}

			return page;
		}).catch(e => {
			if(e instanceof Model.DoesNotExist && host !== 'default') {
				return this.with_monitors({
					host: 'default',
					from_date
				});
			}

			throw e;
		});
	}

	static instanciate({ p_host, p_title, p_sections_json }) {
		return new this({
			host: p_host,
			title: p_title,
			sections: JSON.parse(p_sections_json)
		});
	}

	static truncate() {
		const truncate_page = super.truncate();
		const truncate_p2m = this.run('DELETE FROM page_monitor_m2m');
		return Promise.all([truncate_p2m, truncate_page]);
	}
}

module.exports = { Page };