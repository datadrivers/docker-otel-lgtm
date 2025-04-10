#!/bin/bash

RELEASE="${1:-$(date +%Y%m%d%H%M%S)}"

# Build docker image
cd docker/
podman build -t datadrivers/otel-lgtm:"${RELEASE}" -t datadrivers/otel-lgtm:latest .
cd ../

touch .env

podman run \
	--name lgtm \
	-p 3000:3000 \
	-p 4317:4317 \
	-p 4318:4318 \
	--rm \
	-ti \
	-v "$PWD"/container/grafana:/data/grafana \
	-v "$PWD"/container/prometheus:/data/prometheus \
	-v "$PWD"/container/loki:/data/loki \
	-e GF_PATHS_DATA=/data/grafana \
	--env-file .env \
	datadrivers/otel-lgtm:"${RELEASE}"
