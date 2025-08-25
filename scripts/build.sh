#!/usr/bin/env bash
set -euo pipefail

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Running Prisma migrations (DATABASE_URL detected)"
  npx prisma migrate deploy || npx prisma db push
else
  echo "Skipping Prisma migration: no DATABASE_URL"
fi

npx next build

