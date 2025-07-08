const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");
const { sql } = require("drizzle-orm");
const { companies } = require("../schema/Company"); // Importing the companies table
const { customers } = require("../schema/Customer"); // Importing the customers table

// Junction table for company customers (handles many-to-many relationship between companies and customers)
const companyCustomers = sqliteTable("company_customers", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),

  // Foreign keys
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "CASCADE" }),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "CASCADE" }),

  // Additional fields if needed
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

module.exports = {
  companyCustomers,
};