-- Monitor Checks
CREATE INDEX IF NOT EXISTS idx_mc_date ON monitor_check (mc_date_ms);
CREATE INDEX IF NOT EXISTS idx_mc_monitor_id ON monitor_check (mc_monitor_id);

-- Incidents
CREATE INDEX IF NOT EXISTS idx_i_date ON incident (i_from_ms);
CREATE INDEX IF NOT EXISTS idx_i_monitor_id ON incident (i_monitor_id);

CREATE INDEX IF NOT EXISTS idx_iu_i_id ON incident_update (iu_incident_id);
CREATE INDEX IF NOT EXISTS idx_iu_date ON incident_update (iu_date_ms);
