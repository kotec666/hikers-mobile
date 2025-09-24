include .env

up:
	docker-compose up
down:
	docker-compose down
db_extensions:
# PostGIS пока не нужен. Если понадобится, то в композ-файле образ заменить на postgis/postgis:17-3.5-alpine
# 	docker-compose exec postgres psql -U $POSTGRES_USER --dbname=$POSTGRES_DB -c "CREATE EXTENSION IF NOT EXISTS postgis;"
	docker-compose exec postgres psql -U $POSTGRES_USER --dbname=$POSTGRES_DB -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
	docker-compose exec postgres psql -U $POSTGRES_USER --dbname=$POSTGRES_DB -c "CREATE EXTENSION IF NOT EXISTS btree_gin;"
