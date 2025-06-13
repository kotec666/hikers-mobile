import { readFile, writeFile } from "node:fs/promises";
import "dotenv/config";

/**
 *
 * Для replace .env переменных в background.js после билда приложения (сейчас выполняется, но бесполезен)
 *
 * */

const buffer = await readFile("dist/assets/background.js");
let file = buffer.toString();

file = file.replace(
  "{OPENWEATHERMAP_API_KEY}",
  process.env.OPENWEATHERMAP_API_KEY
);

await writeFile("dist/assets/background.js", file);
