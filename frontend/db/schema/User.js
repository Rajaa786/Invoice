// src/db/schema.js
const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");

// Users table
const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  name: text("name").unique().notNull(),
  email: text("email").unique().notNull()
});

module.exports = { users };
