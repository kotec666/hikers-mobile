
# Мобильное приложение `hikers-mobile`

Документ описывает полный цикл подготовки окружения и запуска приложения React Native без Expo Go.

## Быстрый старт

1. **Установить зависимости**
   ```bash
   yarn
   ```
2. **Создать конфигурацию окружения**
   ```bash
   cp .env.example .env
   # заполните переменные значениями
   ```
3. **Сгенерировать нативные проекты**
   ```bash
   yarn build
   ```

## Подготовка Android-проекта

[//]: # (1. Откройте `./android/build.gradle` и добавьте репозиторий Notifee:)

[//]: # (   ```)

[//]: # (   allprojects {)

[//]: # (     repositories {)

[//]: # (       maven { url&#40;reactNativeAndroidDir&#41; })

[//]: # (       google&#40;&#41;)

[//]: # (       mavenCentral&#40;&#41;)

[//]: # (       maven { url "$rootDir/../node_modules/@notifee/react-native/android/libs" })

[//]: # (       maven { url "https://www.jitpack.io" })

[//]: # (     })

[//]: # (   })

[//]: # (   ```)
1. Для использования lite версии yandex maps в файле `./android/build.gradle` добавьте в ext строку:
   ```
   buildscript {
    ext {
     useYandexMapsLite = true 
    }
   ``` 
2. Сжатие android проекта осуществляется в `./android/app/build.gradle` следующим образом:
   ```xml
        // minifyEnabled enableProguardInReleaseBuilds
           minifyEnabled true
           shrinkResources true
   ```   

3. ~~Создайте~~ `./android/local.properties` и укажите путь к Android SDK (пример для Windows) (сейчас генерируется автоматически с ./scripts/withLocalProperties.js):
   ```
   sdk.dir=C:\\Users\\alexk\\AppData\\Local\\Android\\Sdk
   ```

4. ~~В сгенерированном `AndroidManifest.xml` добавьте foreground‑сервис Notifee внутри тега `<application>`~~:
   ```xml
   <service
     android:name="app.notifee.core.ForegroundService"
     android:foregroundServiceType="health"
     android:exported="false"
     android:stopWithTask="false" />
   ```
   Это необходимо для корректной работы таймера тренировки в фоне.


## Подготовка Ios-проекта

1. Для использования lite версии yandex maps в файле `Podfile` добавьте в начало строку:
   ```
   + ENV['USE_YANDEX_MAPS_LITE'] = "1"
   ...
   ```


## Общая папка `shared`

- **Windows**
  ```powershell
  cd mobile
  mklink /J ".\shared" "..\shared"
  ```
- **Unix (Linux/Mac)**
  ```bash
  cd mobile
  ln -s ../shared ./shared
  ```

## Запуск приложения

1. Для запуска впервые `yarn android` или `yarn ios`. Иначе запустите Metro Bundler:
   ```bash
   yarn start
   ```
2. В интерактивном меню:
   - нажмите `A` для запуска Android-эмулятора/устройства;
   - нажмите `I` для запуска iOS-симулятора.

> **Важно:** проект запускается без Expo Go, используйте стандартные нативные сборки.
