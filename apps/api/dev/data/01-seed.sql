INSERT INTO page (p_host, p_title, p_sections_json) VALUES
	('localhost', 'Local Dashboard', '[{
		"title": "Performance trackers",
		"components": [{
			"type": "performance-tracker",
			"title": null,
			"performance_trackers": [{
				"id": "perf-tracker-1",
				"chart": false,
				"width": 2,
				"unit": "ms",
				"ok": {
					"lte": 150
				},
				"nok": {
					"gte": 300
				}
			}, {
				"id": "perf-tracker-2",
				"chart": true,
				"width": 2,
				"unit": "ms2",
				"ok": {
					"lte": 150
				},
				"nok": {
					"gte": 300
				}
			}]
		}, {
			"type": "performance-tracker",
			"title": null,
			"performance_trackers": [{
				"id": "perf-tracker-3",
				"chart": false,
				"width": null
			}]
		}]
	}, {
		"title": "Mixed monitors & perf",
		"components": [{
			"type": "monitor",
			"title": null,
			"monitors": ["jocolina-landing"]
		}, {
			"type": "performance-tracker",
			"title": null,
			"performance_trackers": [{
				"id": "perf-tracker-3",
				"chart": false,
				"width": null
			}]
		}, {
			"type":"monitor",
			"title": null,
			"monitors": ["jocolina-url-shortener"]
		}]
	}, {
		"title": "Monitors only",
		"components": [{
			"type": "monitor",
			"title": null,
			"monitors": ["jocolina-landing"]
		}, {
			"type":"monitor",
			"title": null,
			"monitors": ["jocolina-url-shortener"]
		}]
	}]'),

	('dev.jocolina.com', 'Jo Dashboard -- Local', '[{
		"title": "Personal projects",
		"components": [{
			"type": "monitor",
			"title": null,
			"monitors": ["jocolina-landing"]
		}, {
			"type": "monitor",
			"title": null,
			"monitors": ["jocolina-url-shortener"]
		}]
	}]');

INSERT INTO monitor (m_id, m_type, m_name, m_config_json) VALUES
	('jocolina-landing', 'http', 'Landing Page', '{"endpoint":"https://jocolina.com"}'),
	('jocolina-url-shortener', 'http', 'URL Shortener', '{"endpoint":"https://l.jocolina.com/yt","follow_redirects":false,"expected_status_range":[302,302],"timeout":150}'),
	('accounts-api', 'http', 'Accounts - API', '{"endpoint":"https://api.accounts.jocolina.com/health","follow_redirects":true,"timeout":300}');

INSERT INTO page_monitor_m2m (monitor_id, page_host) VALUES
	('jocolina-landing', 'localhost'),
	('jocolina-url-shortener', 'localhost'),
	('accounts-api', 'localhost'),

	('jocolina-landing', 'dev.jocolina.com'),
	('jocolina-url-shortener', 'dev.jocolina.com'),
	('accounts-api', 'dev.jocolina.com');

INSERT INTO performance_tracker (pt_id, pt_name, pt_description) VALUES
	('perf-tracker-1', 'DB READ', 'Tracking DB READ Timing'),
	('perf-tracker-2', 'DB WRITE', 'Tracking DB WRITE Timing'),
	('perf-tracker-3', 'Cache hits', 'Latest Cache hits per minute');

INSERT INTO page_performance_tracker_m2m (pt_id, page_host) VALUES
	('perf-tracker-1', 'localhost'),
	('perf-tracker-2', 'localhost'),
	('perf-tracker-3', 'localhost'),

	('perf-tracker-1', 'dev.jocolina.com'),
	('perf-tracker-2', 'dev.jocolina.com'),
	('perf-tracker-3', 'dev.jocolina.com');

