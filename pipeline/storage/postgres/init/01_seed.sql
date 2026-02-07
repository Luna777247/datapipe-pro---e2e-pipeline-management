INSERT INTO dim_sources (source_name, source_type, endpoint_url, frequency)
VALUES
  ('World Bank Regions', 'api', 'https://api.worldbank.org/v2/region', 'daily'),
  ('Example Site', 'scraping', 'https://example.com', 'daily'),
  ('Sample CSV', 'csv', NULL, 'daily')
ON CONFLICT DO NOTHING;

INSERT INTO dim_time (event_time, event_date, event_hour)
VALUES
  ('2025-01-01 00:00:00', '2025-01-01', 0),
  ('2025-01-01 01:00:00', '2025-01-01', 1),
  ('2025-01-01 02:00:00', '2025-01-01', 2)
ON CONFLICT DO NOTHING;
