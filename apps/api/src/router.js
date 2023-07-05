const { Router } = require('@control/cloudflare-workers-router');
const auth = require('./auth');

const {
	Page,
	Monitor,
	MonitorCheck,
	Incident,
	PerformanceTracker
} = require('db');

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

router.post('/pages', auth(request => {
	return request.json().then(data => {
		const { sections, performance, host, title, monitors } = data;

		try {
			Page.validate({ sections, host, title, performance });
		} catch(e) {
			return new Response(JSON.stringify({
				error: e.message
			}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}

		const page_promise = Page.create({
			performance,
			sections,
			host,
			title,
			monitor_ids: monitors
		});
	});
}));

router.post('/monitors', auth(request => {
	return request.json().then(data => {
		try {
			Monitor.validate(data);
		} catch(e) {
			return new Response(JSON.stringify({
				error: e.message
			}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}
		return Monitor.create(data);
	});
}));

router.get('/:endpoint/performance', (request, { endpoint }) => {
	// return all performance trackers for this endpoint
	// same as for page but without WERE host = ?
	const url = new URL(request.url);
	const days_ago_30 = new Date();
	days_ago_30.setDate(days_ago_30.getDate() - 30);

	const date_iso = url.searchParams.get('from_date') || days_ago_30.toISOString();
	const from_date_ms = new Date(date_iso).getTime();

	const aggregate_min = Number.parseInt(url.searchParams.get('aggregate_min') || 15);

	const page_promise = Page.find({ host: endpoint });
	const perf_promise = PerformanceTracker.for_page({
		host: endpoint,
		from_date_ms,
		aggregate_min
	});

	return Promise.all([ page_promise, perf_promise ]).then(([ page, performance_trackers ]) => {
		return {
			page,
			performance_trackers
		}
	});
});

const instanciate_points = (tracker_id, raw_points) => {
	return raw_points.map(({ date, value, region }) => {
		return {
			value,
			region,
			tracker_id,
			date_ms: new Date(date).getTime(),
		}
	});
};

router.post('/performance-tracker', request => {
	return request.json().then(data => {
		try {
			PerformanceTracker.validate(data);
		} catch(e) {
			return new Response(JSON.stringify({
				error: e.message
			}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}

		return PerformanceTracker.create(data);
	});
});

router.post('/performance', auth(request => {
	// Allows for many points at once
	const url = new URL(request.url);

	// Data:
	// [{
	// 	id: '',
	// 	description: '',
	// 	page_hosts: [],
	//	project: ''
	// 	points: []
	// }, ...]

	return request.json().then(data => {
		if(!Array.isArray(data)) {
			return new Response(JSON.stringify({
				error: 'Must be an array of trackers with data points'
			}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}

		try {
			data.forEach(({ id, points: raw_points }) => {
				const points = instanciate_points(id, raw_points);
				points.forEach(point => PerformanceTracker.validate_point(point));
			});
		} catch(e) {
			return new Response(JSON.stringify({
				error: e.message
			}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}

		// Check if performance-tracker exists
		// otherwise create
		// SQLite does not enforce foreign keys by default
		// So we're gonna have to check PRAGMA foreign_keys = ON
		// https://www.sqlite.org/foreignkeys.html

		// Algo:
		// insert data points for every tracker
		// if fails -> insert performance tracker & data point in transaction
		const promises = data.map(({ id, name, project, display_config, description, page_hosts, points: raw_points }) => {
			if(!raw_points?.length) {
				return;
			}

			const points = instanciate_points(id, raw_points);

			return PerformanceTracker.add_points(points).catch(e => {
				const foreign_key_test = /FOREIGN KEY constraint failed/;

				if(foreign_key_test.test(e.cause.toString())) {
					return PerformanceTracker.create({
						id,
						name,
						description,
						project,
						display_config,
						page_hosts,
					}).then(() => {
						return PerformanceTracker.add_points(points);
					});
				}

				throw e;
			});
		});

		return Promise.all(promises).then(() => {
			return {
				success: true
			}
		});
	});
}));

router.get('/monitors', auth(request => {
	return Monitor.all();
}));

module.exports = router;
