#!/usr/bin/env bash

set -e

docker-compose -p privatepm pull
docker-compose -p privatepm up -d client
