set -e

echo Очищаемся
docker system prune -a --volumes -f

git fetch origin

BACKEND_CHANGED=$(git diff --name-only HEAD..origin/master -- backend/)
FRONTEND_CHANGED=$(git diff --name-only HEAD..origin/master -- frontend/)

# Флаги для сборки
BUILD_BACKEND=false
BUILD_FRONTEND=false

if [[ ! -z "$BACKEND_CHANGED" ]]; then
    echo "Изменения замечены на беке"
    BUILD_BACKEND=true
fi

if [[ ! -z "$FRONTEND_CHANGED" ]]; then
    echo "Изменения замечены на фронте"
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
        echo Останавливаем бэк
        docker-compose down backend || true

        docker-compose build backend
    elif [ "$BUILD_BACKEND" = false ] && [ "$BUILD_FRONTEND" = true ]; then
        echo Останавливаем фронт
        docker-compose down frontend || true

        docker-compose build frontend
    else
        echo Останавливаем контейнеры
        docker-compose down || true

        docker-compose build
fi

docker-compose up -d --remove-orphans
