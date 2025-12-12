set -e

echo Очищаемся
docker system prune -a --volumes -f

echo Останавливаем контейнер
docker-compose down || true

git fetch origin

BACKEND_CHANGED=$(git diff --name-only HEAD..origin/master -- backend/)
FRONTEND_CHANGED=$(git diff --name-only HEAD..origin/master -- frontend/)

# Флаги для сборки
BUILD_BACKEND=false
BUILD_FRONTEND=false

if [[ ! -z "$BACKEND_CHANGED" ]]; then
    echo "Changes detected in backend"
    BUILD_BACKEND=true
fi

if [[ ! -z "$FRONTEND_CHANGED" ]]; then
    echo "Changes detected in frontend"
    BUILD_FRONTEND=true
fi


echo Пуллим изменения
git pull origin master

# (@TODO подружить линки и докер)
echo Копируем шаред
rm -rf backend/src/shared
rm -rf frontend/src/shared
cp -R ./shared backend/src
cp -R ./shared frontend/src

echo Пересобираем и запускаем контейнеры
if [ "$BUILD_BACKEND" = true ] && [ "$BUILD_FRONTEND" = false ]; then
        docker-compose build backend
    elif [ "$BUILD_BACKEND" = false ] && [ "$BUILD_FRONTEND" = true ]; then
        docker-compose build frontend
    else
        docker-compose build
fi

docker-compose up -d --remove-orphans
