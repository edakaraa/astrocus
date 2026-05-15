import fs from "fs";
import dotenv from "dotenv";
import path from "path";

/** Always resolves to backend/.env (works with tsx and compiled dist). */
export const ENV_FILE_PATH = path.resolve(__dirname, "..", ".env");

if (!fs.existsSync(ENV_FILE_PATH)) {
  console.error(`[Astrocus API] .env bulunamadı: ${ENV_FILE_PATH}`);
} else if (fs.statSync(ENV_FILE_PATH).size === 0) {
  console.error(
    `[Astrocus API] .env dosyası boş. ${ENV_FILE_PATH} içine anahtarları yazıp kaydedin (Ctrl+S).`,
  );
} else {
  const result = dotenv.config({ path: ENV_FILE_PATH });
  if (result.error) {
    console.error(`[Astrocus API] .env okunamadı:`, result.error.message);
  }
}
