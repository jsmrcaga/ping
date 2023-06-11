const { Page, Monitor, MonitorCheck, Incident } = require('db');
const { Router } = require('@control/cloudflare-workers-router');

const router = new Router();

router.get('/health', () => {
	return {
		status: "ok"
	};
});

router.get('/:endpoint', (request, { endpoint }) => {
	// For now default is "last month"
	const incidents_query = Incident.for_page({ host: endpoint, unresolved: false });
	const page_query = Page.with_monitors({ host: endpoint });

	return Promise.all([page_query, incidents_query]).then(([page, all_incidents]) => {
		// TODO: aggregate monitors by day on server ?
		const { scheduled_maintenance, incidents } = all_incidents.reduce((agg, incident) => {
			if(incident.is_maintenance) {
				agg.scheduled_maintenance.push(incident);
				return agg;
			}

			agg.incidents.push(incident);
			return agg;
		}, {
			incidents: [],
			scheduled_maintenance: []
		});

		return {
			...page,
			incidents,
			scheduled_maintenance
		};
	});
});

router.get('/:endpoint/incidents', (request, { endpoint }) => {
	const incidents_promise = Incident.for_page({ host: endpoint, unresolved: false });
	const monitors_promise = Monitor.for_page({ host: endpoint, unresolved: false });
	return Promise.all([incidents_promise, monitors_promise]).then(([incidents, monitors]) => {
		const monitors_by_id = monitors.reduce((agg, monitor) => {
			agg[monitor.id] = monitor;
			return agg;
		}, {});

		return {
			incidents,
			monitors: monitors_by_id
		};
	});
});

router.get('/:endpoint/incidents/:id', (request, { endpoint, id }) => {
	return Incident.with_updates({ incident_id: id }).then((incident) => {
		return incident;
	});
});

module.exports = router;
