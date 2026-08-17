echo Останавливаем контейнеры
docker-compose down

echo Пуллим изменения
git pull origin master

echo Собираем контейнеры
docker-compose up -d --build

echo Чистим неактуальные образы
docker image prune -f