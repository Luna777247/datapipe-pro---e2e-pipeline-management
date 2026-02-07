# Power BI Dashboard Setup

1) Open Power BI Desktop.
2) Import connection file: pipeline/visualization/powerbi/datapipe.pbids
3) Use credentials `datapipe/datapipe`.
4) Load tables: fact_metrics, dim_sources, dim_time.
5) Build visuals defined in pipeline/dashboards/time_series_dashboard.md.
6) Export a `.pbit` template and save it in this folder.

## Notes
- Power BI Desktop is required to create `.pbit` templates.
- If you prefer BigQuery, update the PBIDS file accordingly.
