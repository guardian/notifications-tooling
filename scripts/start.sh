#!/bin/bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=$DIR/..
DATABASE_DIR=$ROOT_DIR/src/packages/database

PIDS=()

runNginx() {
  if pgrep -f nginx >/dev/null; then
    echo "nginx is already running"
  else
    echo "nginx isn't running, booting now..."
    dev-nginx restart
  fi
}

start_frontend() {
  echo "Starting frontend..."
  pushd $ROOT_DIR/src/apps/frontend
  bun run dev &
  PIDS+=($!)
  popd
}

start_backend() {
  echo "Starting backend..."
  pushd $ROOT_DIR/src/apps/backend
  bun --env-file="$DATABASE_DIR/.env" run dev &
  PIDS+=($!)
  popd
}


runNginx
start_frontend
start_backend

echo ""
echo "Running dispatch at:"
printf '\033[32mhttps://dispatch.local.dev-gutools.co.uk\033[0m\n'
echo ""

trap "exit" INT TERM
trap 'kill ${PIDS[*]}' EXIT

wait
