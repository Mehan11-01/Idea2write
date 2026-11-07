#!/usr/bin/env bash
# Runs the migrations and the security/flow tests against a throwaway local Postgres database.
# Usage: PGHOST=/path/to/socket PGPORT=5432 ./run_local_tests.sh
set -e
cd "$(dirname "$0")"
P="psql -U ${PGUSER:-postgres} -q"
$P -c "drop database if exists i2w_test" -c "create database i2w_test" >/dev/null
for f in 00_local_supabase_emulation.sql ../migrations/*.sql; do $P -d i2w_test -v ON_ERROR_STOP=1 -f "$f" 2>&1 | grep -v NOTICE || true; done
$P -d i2w_test -f 10_security_and_flow_tests.sql 2>&1 | grep -v NOTICE
