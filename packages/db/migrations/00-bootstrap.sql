CREATE TABLE IF NOT EXISTS monitor (
	m_id TEXT PRIMARY KEY,
	m_type TEXT NOT NULL,
	m_name TEXT,
	m_config_json TEXT,
	m_last_check_time INTEGER,
	m_interval_ms INTEGER DEFAULT 60000, -- 10 mins
	m_consecutive_failed_checks_incident INTEGER DEFAULT 3 NOT NULL
);

CREATE TABLE IF NOT EXISTS monitor_check (
	mc_monitor_id TEXT NOT NULL,
	mc_up BOOLEAN NOT NULL,
	mc_result TEXT,
	mc_date_ms INTEGER NOT NULL,
	mc_ping_ms INTEGER,
	mc_error TEXT,
	PRIMARY KEY (mc_monitor_id, mc_date_ms),
	FOREIGN KEY (mc_monitor_id) REFERENCES monitor (m_id)
);

CREATE TABLE IF NOT EXISTS page (
	p_host TEXT PRIMARY KEY NOT NULL,
	p_title TEXT NOT NULL,
	p_sections_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS page_monitor_m2m (
	monitor_id TEXT NOT NULL,
	page_host TEXT NOT NULL,
	PRIMARY KEY (monitor_id, page_host),
	FOREIGN KEY (monitor_id) REFERENCES monitor (m_id),
	FOREIGN KEY (page_host) REFERENCES page (p_host)
);

-- INCIDENTS
-- and SCHEDULED MAINTENANCE
CREATE TABLE IF NOT EXISTS incident (
	i_id INTEGER PRIMARY KEY AUTOINCREMENT,
	i_monitor_id TEXT NOT NULL,
	i_from_ms INTEGER NOT NULL,
	i_to_ms INTEGER, -- if null -> ongoing
	i_title TEXT,
	i_description TEXT,
	i_is_maintenance BOOLEAN NOT NULL DEFAULT FALSE,
	i_expected_duration_ms INTEGER,
	FOREIGN KEY (i_monitor_id) REFERENCES monitor (m_id)
);

CREATE TABLE IF NOT EXISTS incident_update (
	iu_incident_id TEXT NOT NULL,
	iu_date_ms INTEGER NOT NULL,
	iu_title TEXT,
	iu_description TEXT NOT NULL,
	FOREIGN KEY (iu_incident_id) REFERENCES incident (i_id)
);
