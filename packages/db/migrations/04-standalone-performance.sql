CREATE TABLE performance_tracker_new (
	pt_id TEXT PRIMARY KEY,
	pt_name TEXT NOT NULL,
	pt_description TEXT DEFAULT NULL,
	pt_project TEXT DEFAULT NULL,
	pt_display_config TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS performance_point_new (
	pp_tracker_id INTEGER NOT NULL,
	pp_date_ms INTEGER NOT NULL,
	pp_value INTEGER NOT NULL,
	pp_region TEXT,

	FOREIGN KEY (pp_tracker_id) REFERENCES performance_tracker_new (pt_id)
);

CREATE TABLE IF NOT EXISTS page_performance_tracker_m2m (
	pt_id TEXT NOT NULL,
	page_host TEXT NOT NULL,
	PRIMARY KEY (pt_id, page_host),
	FOREIGN KEY (pt_id) REFERENCES performance_tracker_new (pt_id),
	FOREIGN KEY (page_host) REFERENCES page (p_host)
);

ALTER TABLE page ADD COLUMN p_performance_json TEXT;

DROP TABLE performance_tracker;
DROP TABLE performance_point;

ALTER TABLE performance_tracker_new RENAME TO performance_tracker;
ALTER TABLE performance_point_new RENAME TO performance_point;
