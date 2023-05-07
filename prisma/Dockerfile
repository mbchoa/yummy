FROM postgres:14.5

ENV POSTGRES_PASSWORD yumshin
ENV POSTGRES_USER yumshin
ENV POSTGRES_DB yumshin

RUN apt-get update \
      && apt-get install -y --no-install-recommends \
      && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /docker-entrypoint-initdb.d

RUN apt-get update && apt-get install postgresql-14-similarity && rm -rf /var/lib/apt/lists/*
