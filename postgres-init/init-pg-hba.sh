#!/bin/bash
set -e

# Agregar configuración para permitir conexiones sin SSL desde la red Docker
echo "host all all 0.0.0.0/0 md5" >> "$PGDATA/pg_hba.conf"

# Recargar configuración de PostgreSQL
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT pg_reload_conf();
EOSQL
