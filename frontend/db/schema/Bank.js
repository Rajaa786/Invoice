const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");
const { companies } = require("./Company");

const banks = sqliteTable("banks", {
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    companyId: integer("company_id").notNull().references(() => companies.id, { onDelete: "CASCADE" }),
    bankName: text("bank_name").notNull(),
    accountNumber: text("account_number").notNull(),
    ifscCode: text("ifsc_code").notNull(),
    branchName: text("branch_name").notNull(),
    accountHolderName: text("account_holder_name").notNull(),
    accountType: text("account_type").default("savings"), // savings, current, fixed_deposit, etc.
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

module.exports = { banks }; 