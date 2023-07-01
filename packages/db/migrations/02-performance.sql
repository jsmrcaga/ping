CREATE TABLE IF NOT EXISTS performance_tracker (
	pt_id INTEGER PRIMARY KEY AUTOINCREMENT,
	pt_monitor_id TEXT NOT NULL,
	pt_description TEXT NOT NULL,

	FOREIGN KEY (pt_monitor_id) REFERENCES monitor (m_id)
);

CREATE TABLE IF NOT EXISTS performance_point (
	pp_tracker_id INTEGER NOT NULL,
	pp_date_ms INTEGER NOT NULL,
	pp_value INTEGER NOT NULL,
	pp_region TEXT NOT NULL,

	FOREIGN KEY (pp_tracker_id) REFERENCES performance_tracker (pt_id)
);

CREATE INDEX IF NOT EXISTS idx_pt_id ON performance_tracker (pt_id);
CREATE INDEX IF NOT EXISTS idx_pp_tracker_id ON performance_point (pp_tracker_id);
CREATE INDEX IF NOT EXISTS idx_pp_date ON performance_point (pp_date_ms);
