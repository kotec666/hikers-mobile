#!/bin/bash

envPath=".env"
examplePath="env.example"

if [ ! -f "$envPath" ]; then
    echo "The .env file is absent. We create it from env.example ..."

    if [ -f "$examplePath" ]; then
        cp "$examplePath" "$envPath"
        echo "The .env file is based on env.example."
    else
        echo "File env.example is absent. It is impossible to create .env."
        exit 1
    fi
else
    echo "The .env file already exists."
fi

# Создаем символические ссылки для frontend/.env и backend/.env
for dir in frontend backend; do
    envLink="$dir/.env"

    if [ ! -e "$envLink" ]; then
        echo "Creating a symbolic link for $dir/.env ..."
        ln -s ../.env "$envLink"
        echo "Symbolic link for $dir/.env created."
    else
        echo "A symbolic link for $dir/.env already exists."
    fi
done
