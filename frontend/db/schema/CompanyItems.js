const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");
const { sql } = require("drizzle-orm");
const { companies } = require("../schema/Company"); // Importing the companies table
const { items } = require("../schema/Item"); // Importing the items table

// Junction table for company items (handles many-to-many relationship between companies and items)
const companyItems = sqliteTable("company_items", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),

  // Foreign keys
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "CASCADE" }),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "CASCADE" }),

  // Additional fields if needed
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

module.exports = {
  companyItems,
};