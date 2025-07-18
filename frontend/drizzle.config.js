require("dotenv").config();
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: 'sqlite', // 'mysql' | 'sqlite' | 'turso'
  schema: './db/schema',
  dbCredentials: {
    url: process.env.DB_FILE_NAME,
  },
})