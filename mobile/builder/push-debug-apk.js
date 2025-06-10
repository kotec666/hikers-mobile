import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { openAsBlob } from "node:fs";
import { readFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const push = async () => {
  const filepath = join(
    __dirname,
    "../android/app/build/outputs/apk/debug/app-debug.apk"
  );
  const jsonpath = join(__dirname, "../package.json");
  const jsonFile = await readFile(jsonpath, {
    encoding: "utf-8",
  });
  const packageJSON = JSON.parse(jsonFile);
  const file = await openAsBlob(filepath);

  const form = new FormData();

  form.append("file", file, "app.apk");
  form.append("name", "hikers");
  form.append("countour", "development");
  form.append("os", "android");
  form.append("version", packageJSON.version);

  const request = await fetch("http://manager:3000/apps", {
    method: "POST",
    body: form,
  });

  const result = await request.json();

  console.log(result);
};

push();
