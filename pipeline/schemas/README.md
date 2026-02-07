# Data Warehouse Schema

This schema uses a simple star model to support time-series dashboards.

- Fact table: fact_metrics
- Dimensions: dim_sources, dim_time

Load order:
1) dim_sources
2) dim_time
3) fact_metrics
