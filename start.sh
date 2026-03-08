echo Останавливаем контейнеры
docker-compose down

echo Пуллим изменения
git pull origin master

# (@TODO подружить линки и докер)
echo Копируем шаред
rm -rf backend/src/shared
rm -rf frontend/src/shared
cp -R ./shared backend/src
cp -R ./shared frontend/src

echo Собираем контейнеры
docker-compose up -d --build
