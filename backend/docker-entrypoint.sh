#!/bin/sh
set -e

# Wait for MongoDB to be ready (handled by depends_on healthcheck in compose)
echo "Starting backend..."
node scripts/seed.js || true
exec node server.js
