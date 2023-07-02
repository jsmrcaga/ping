-- MONITOR DATA
INSERT INTO monitor_check (mc_monitor_id, mc_up, mc_result, mc_date_ms, mc_ping_ms, mc_error) VALUES
	('jocolina-landing', 1, 200, 1684693730337, 243, NULL),
	('jocolina-landing', 1, 200, 1684693790337, 233, NULL),
	('jocolina-landing', 1, 200, 1684693850337, 200, NULL),
	('jocolina-landing', 1, 200, 1684693910337, 145, NULL),
	('jocolina-landing', 1, 200, 1684693970337, 187, NULL),

	('jocolina-url-shortener', 1, 200, 1684693730337, 100, NULL),
	('jocolina-url-shortener', 1, 200, 1684693790337, 80, NULL),
	('jocolina-url-shortener', 1, 200, 1684693850337, 82, NULL),
	('jocolina-url-shortener', 0, 500, 1684693910337, 93, 'fml'),
	('jocolina-url-shortener', 0, 500, 1684693970337, 95, 'fml');

-- INCIDENT DATA
INSERT INTO incident (i_id, i_monitor_id, i_from_ms, i_to_ms, i_title, i_description, i_is_maintenance, i_expected_duration_ms) VALUES
	(1, 'jocolina-url-shortener', 1668106461123, 1668147612654, 'Redirections not working', 'Cache server seems down', FALSE, NULL),
	(2, 'jocolina-url-shortener', 1674291612654, 1674299218321, 'Redirections are looping', 'Our cache server is redirecting to the small url and getting hit again', FALSE, NULL),

	(3, 'jocolina-landing', 1684526130234, 1684551690000, 'Database unresponsive', 'We are aware of the slow query times. This is due to an unresponsive node on the database cluster, we are actively looking into the problem', FALSE, NULL),
	(4, 'jocolina-landing', 1684526130234, 1684551690000, 'Another incident on the same date', '', FALSE, NULL),
	(5, 'jocolina-landing', 1686384000000, NULL, 'Scheduled maintenance - DB Upgrade', 'We need to upgrade our database (cause of last incident). We are expecting a downtime of around 2 hours', TRUE, 14400000),
	(6, 'jocolina-landing', 1686385000000, NULL, 'Automatic Incident', 'Oopsie doopsie dooba di doo', FALSE, 14400000);

INSERT INTO incident_update (iu_incident_id, iu_date_ms, iu_title, iu_description) VALUES
	(2, 1685174400000, 'Duration updated', 'After careful consideration we believe our DB upgrade should take 4 hours instead of 2. We will keep you updated'),
	(2, 1685179260000, 'Problem identified', 'We have identified the problem and setup a dedicated team. Duration has not been updated'),
	(2, 1685181934000, 'Problem solved', 'Our team has fixed the problem and will continue monitoring for 24hs');

-- PERFORMANCE DATA
INSERT INTO performance_point (pp_tracker_id, pp_date_ms, pp_value, pp_region) VALUES
	('perf-tracker-1', 1688316736502, 845, NULL),
	('perf-tracker-1', 1688317636502, 467, NULL),
	('perf-tracker-1', 1688318536502, 865, NULL),
	('perf-tracker-1', 1688319436502, 726, NULL),
	('perf-tracker-1', 1688320336502, 126, NULL),
	('perf-tracker-1', 1688321236502, 872, NULL),
	('perf-tracker-1', 1688322136502, 91, NULL),
	('perf-tracker-1', 1688323036502, 658, NULL),
	('perf-tracker-1', 1688323936502, 470, NULL),
	('perf-tracker-1', 1688324836502, 240, NULL),
	('perf-tracker-1', 1688325736502, 993, NULL),
	('perf-tracker-1', 1688326636502, 222, NULL),
	('perf-tracker-1', 1688327536502, 398, NULL),
	('perf-tracker-1', 1688328436502, 36, NULL),
	('perf-tracker-1', 1688329336502, 308, NULL),

	('perf-tracker-2', 1688316736502, 132, NULL),
	('perf-tracker-2', 1688317636502, 685, NULL),
	('perf-tracker-2', 1688318536502, 257, NULL),
	('perf-tracker-2', 1688319436502, 894, NULL),
	('perf-tracker-2', 1688320336502, 367, NULL),
	('perf-tracker-2', 1688321236502, 641, NULL),
	('perf-tracker-2', 1688322136502, 977, NULL),
	('perf-tracker-2', 1688323036502, 950, NULL),
	('perf-tracker-2', 1688323936502, 154, NULL),
	('perf-tracker-2', 1688324836502, 339, NULL),
	('perf-tracker-2', 1688325736502, 660, NULL),
	('perf-tracker-2', 1688326636502, 653, NULL),
	('perf-tracker-2', 1688327536502, 175, NULL),
	('perf-tracker-2', 1688328436502, 191, NULL),
	('perf-tracker-2', 1688329336502, 754, NULL),

	('perf-tracker-3', 1688316736502, 953, NULL),
	('perf-tracker-3', 1688317636502, 929, NULL),
	('perf-tracker-3', 1688318536502, 134, NULL),
	('perf-tracker-3', 1688319436502, 932, NULL),
	('perf-tracker-3', 1688320336502, 743, NULL),
	('perf-tracker-3', 1688321236502, 723, NULL),
	('perf-tracker-3', 1688322136502, 817, NULL),
	('perf-tracker-3', 1688323036502, 93, NULL),
	('perf-tracker-3', 1688323936502, 236, NULL),
	('perf-tracker-3', 1688324836502, 235, NULL),
	('perf-tracker-3', 1688325736502, 739, NULL),
	('perf-tracker-3', 1688326636502, 542, NULL),
	('perf-tracker-3', 1688327536502, 293, NULL),
	('perf-tracker-3', 1688328436502, 304, NULL),
	('perf-tracker-3', 1688329336502, 303, NULL);
