#!/usr/bin/env bash

set -e

sed -i -e "s|\$API_SUB|$API|g" /usr/share/nginx/html/*

exec "$@"
