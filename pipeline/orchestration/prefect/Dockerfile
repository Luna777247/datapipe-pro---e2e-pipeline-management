FROM prefecthq/prefect:2.20.0

USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends openjdk-17-jre-headless procps \
  && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

USER prefect
