1 install android sdk (tested on 35v)<br>

```
apt install android-sdk
```

2 install jdk-17<br>

```
apt install openjdk-17-jdk openjdk-17-jre
```

3 install node 22<br>

```
curl -sL https://deb.nodesource.com/setup_22.0 -o /tmp/nodesource_setup.sh

bash /tmp/nodesource_setup.sh
```

4 install node modules<br>

```
yarn
```

5 build frontend<br>

```
yarn build
```

6 sync android and ios with frontend<br>

```
npx cap sync
```

7 build android<br>

```
cd android && ./gradlew assemble{Debug/Release}
```

8 sign apk/aab<br>

```
cd app/build/outputs/{apk/aab}/{debug/release}
jarsigner -keystore YOUR_KEYSTORE_PATH -storepass YOUR_KEYSTORE_PASS app-release-unsigned.apk YOUR_KEYSTORE_ALIAS &&
```
