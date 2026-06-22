CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  service_name VARCHAR(120) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_logs (
  id UUID PRIMARY KEY,
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  log_level VARCHAR(50) NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at);
CREATE INDEX IF NOT EXISTS idx_incident_logs_incident_id ON incident_logs(incident_id);

CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY,
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  possible_root_cause TEXT NOT NULL,
  confidence VARCHAR(50) NOT NULL,
  debugging_steps JSONB NOT NULL,
  rollback_recommendation TEXT NOT NULL,
  production_impact TEXT NOT NULL,
  postmortem_draft TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_incident_id ON ai_analyses(incident_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON ai_analyses(created_at);
