const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");

const states = sqliteTable("states", {
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    name: text("name").notNull(),
    code: text("code").notNull(), // State code like "MH", "DL", etc.
    country: text("country").notNull().default("India"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(Date.now()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(Date.now()),
});

module.exports = { states }; 