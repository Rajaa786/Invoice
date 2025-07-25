const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");
const { states } = require("./State");

const cities = sqliteTable("cities", {
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    name: text("name").notNull(),
    stateId: integer("state_id").notNull().references(() => states.id, { onDelete: "CASCADE" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(Date.now()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(Date.now()),
});

module.exports = { cities }; 