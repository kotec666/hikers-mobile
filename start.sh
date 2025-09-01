set -e
source ./.env

echo Останавливаем контейнер
docker-compose down || true

echo Пуллим изменения
git pull origin master

echo Пересобираем и запускаем контейнер
docker-compose up -d --build --remove-orphans

echo Активируем расширения для БД
docker-compose exec -T postgres psql -U $POSTGRES_USER --dbname=$POSTGRES_DB -c "CREATE EXTENSION IF NOT EXISTS postgis;"
docker-compose exec -T postgres psql -U $POSTGRES_USER --dbname=$POSTGRES_DB -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"