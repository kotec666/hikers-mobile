set -e
source ./.env

echo Останавливаем контейнер
docker-compose down || true

echo Пуллим изменения
git pull origin master

echo Пересобираем и запускаем контейнер
docker-compose up -d --build --remove-orphans