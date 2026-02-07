from __future__ import annotations

from prefect.deployments import Deployment
from prefect.server.schemas.schedules import CronSchedule

from flow import e2e_data_pipeline_daily


def main() -> None:
    deployment = Deployment.build_from_flow(
        flow=e2e_data_pipeline_daily,
        name="daily",
        work_queue_name="default",
        schedule=CronSchedule(cron="0 2 * * *", timezone="UTC"),
    )
    deployment.apply()
    print("Applied Prefect deployment: e2e_data_pipeline_daily/daily")


if __name__ == "__main__":
    main()
