const { sqliteTable, text, real, integer } = require("drizzle-orm/sqlite-core");
const { invoices } = require("./Invoice");

const tallySalesVoucher = sqliteTable("tally_sales_voucher", {
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    invoiceId: integer("invoice_id")
        .unique()
        .notNull()
        .references(() => invoices.id, { onDelete: "CASCADE" }),
    effective_date: integer("effective_date", { mode: "timestamp" }),
    bill_reference: text("bill_reference"),
    failed_reason: text("failed_reason"),
    bank_ledger: text("bank_ledger").notNull(),
    result: integer("result", { mode: "boolean" }),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(Date.now()),
});

module.exports = { tallySalesVoucher }; 