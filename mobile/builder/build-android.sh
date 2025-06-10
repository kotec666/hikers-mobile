#!/bin/sh

cd /app

echo "Installing packages"
yarn

echo "Building frontend"
yarn build

echo "Syncing with frontend"
npx cap sync --deployment

echo "build android"
cd android
./gradlew assembleDebug

echo "pushing to manager"
cd ..
node ./builder/push-debug-apk.js