#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/sofi"
PROJECT_DIR="/var/www/sofi-website"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate backup filename with timestamp
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"

# Create database backup
cd $PROJECT_DIR
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U ${POSTGRES_USER:-sofi} ${POSTGRES_DB:-sofi_db} > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Remove old backups (older than RETENTION_DAYS)
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_FILE.gz"

