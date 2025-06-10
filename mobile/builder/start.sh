echo "Clearing dirty changes"
git add .
git stash push --include-untracked
git stash drop

echo "Pulling changes"
git pull

echo "Starting the builder"
docker compose up builder