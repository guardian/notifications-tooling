#!/bin/bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
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
  pushd ./src/apps/frontend
  bun run dev &
  PIDS+=($!)
  popd
}

start_backend() {
  echo "Starting backend..."
  pushd ./src/apps/backend
  bun run dev &
  PIDS+=($!)
  popd
}


runNginx
start_frontend
start_backend

trap "exit" INT TERM
trap 'kill ${PIDS[*]}' EXIT

wait
