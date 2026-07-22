#!/usr/bin/env bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
ROOT_DIR=$DIR/..


dev-nginx setup-app "$ROOT_DIR/dev-nginx.yaml"
bun install