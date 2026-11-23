import path from "path";
import dotenv from "dotenv";

// Cari .env di folder kerja dan satu tingkat di atasnya (mode full-stack: .env ada di root).
dotenv.config({ path: path.resolve(process.cwd(), ".env"), quiet: true });
dotenv.config({ path: path.resolve(process.cwd(), "..", ".env"), quiet: true });
