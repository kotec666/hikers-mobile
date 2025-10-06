1. Установить библиотеки `yarn`
2. Заполнить .env файл по примеру
3. Создать симлинк на shared
   3.1. Для Windows: `cd backend && mklink /J "./src/shared" "../shared"`
   3.2. Для Unix(Linux/Mac): `cd backend && ln -s ../shared ./src/shared`
4. Запустить через `yarn start:dev` и радоваться жизни
