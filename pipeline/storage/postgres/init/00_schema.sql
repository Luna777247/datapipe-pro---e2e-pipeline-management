CREATE TABLE IF NOT EXISTS dim_sources (
  source_id SERIAL PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  endpoint_url TEXT,
  frequency TEXT
);

CREATE TABLE IF NOT EXISTS dim_time (
  time_id SERIAL PRIMARY KEY,
  event_time TIMESTAMP NOT NULL,
  event_date DATE NOT NULL,
  event_hour INT NOT NULL
);

CREATE TABLE IF NOT EXISTS fact_metrics (
  metric_id SERIAL PRIMARY KEY,
  source_id INT NOT NULL REFERENCES dim_sources(source_id),
  time_id INT NOT NULL REFERENCES dim_time(time_id),
  metric_value DOUBLE PRECISION NOT NULL,
  metric_status TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
