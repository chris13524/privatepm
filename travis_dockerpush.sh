#!/usr/bin/env bash

set -e

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker push chris13524/privatepm-client:latest
docker push chris13524/privatepm-server:latest
