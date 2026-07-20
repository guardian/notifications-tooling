#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$ROOT_DIR/build/lambda"
ARTIFACT_DIR="$ROOT_DIR/dist"
ZIP_FILE="$ARTIFACT_DIR/dispatch.zip"
BACKEND_HANDLER="$ROOT_DIR/src/apps/backend/dist/handler.js"
FRONTEND_DIST_DIR="$ROOT_DIR/src/apps/frontend/dist"

cd "$ROOT_DIR" || exit 1

rm -f "$ZIP_FILE"
mkdir -p "$ARTIFACT_DIR"

cd "$ROOT_DIR/src/apps/backend" || exit 1
bun run build

cd "$ROOT_DIR/src/apps/frontend" || exit 1
bun run build

cd "$ROOT_DIR" || exit 1

if [[ ! -f "$BACKEND_HANDLER" ]]; then
	echo "Missing backend build artifact: $BACKEND_HANDLER" >&2
	exit 1
fi

if [[ ! -d "$FRONTEND_DIST_DIR" ]]; then
	echo "Missing frontend build artifact: $FRONTEND_DIST_DIR" >&2
	exit 1
fi

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/backend" "$BUILD_DIR/frontend"
cp "$BACKEND_HANDLER" "$BUILD_DIR/backend/"
cp -R "$FRONTEND_DIST_DIR" "$BUILD_DIR/frontend/"
cd "$BUILD_DIR" || exit 1

zip -r "$ZIP_FILE" backend frontend

echo "Lambda build artifact created: $ZIP_FILE"

rm -rf "$BUILD_DIR"
rmdir "$ROOT_DIR/build" 2>/dev/null || true