set -e

echo Останавливаем контейнер
docker-compose down || true

echo Пуллим изменения
git pull origin master

# (@TODO подружить линки и докер)
echo Копируем шаред
rm -rf backend/src/shared
rm -rf frontend/src/shared
cp -R ./shared backend/src
cp -R ./shared frontend/src

echo Пересобираем и запускаем контейнер
docker-compose up -d --build --remove-orphans
