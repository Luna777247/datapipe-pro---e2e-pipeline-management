FROM prefecthq/prefect:2-latest

USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends openjdk-21-jre-headless procps \
  && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"
