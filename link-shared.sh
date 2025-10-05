echo "Линкуем в бекенд"
cd backend/src && ln -s ../../shared ./shared || true

cd ../..

echo "Линкуем во фронтенд"
cd frontend/src && ln -s ../../shared ./shared || true

cd ../..
