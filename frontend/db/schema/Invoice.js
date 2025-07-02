// src/db/schema.js
const { sqliteTable, text, integer, real } = require("drizzle-orm/sqlite-core");
const { sql } = require("drizzle-orm");
const { companies } = require("../schema/Company");
const { customers } = require("../schema/Customer");

// Main Invoice table
const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),

  // Foreign keys to company and customer
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),

  // Invoice details
  invoiceNo: text("invoice_no").notNull().unique(),
  invoiceDate: integer("invoice_date", { mode: "timestamp" }).notNull(),
  dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
  terms: text("terms").notNull(),
  ledger: text("ledger"),

  // Status tracking - Enhanced for analytics
  status: text("status").notNull().default("pending"), // 'pending', 'paid', 'overdue', 'cancelled', 'draft'
  paidDate: integer("paid_date", { mode: "timestamp" }), // When invoice was paid
  paymentMethod: text("payment_method"), // 'cash', 'bank_transfer', 'cheque', 'card', 'upi'
  paymentReference: text("payment_reference"), // Reference number for payment

  // Tax information
  cgstRate: real("cgst_rate"),
  sgstRate: real("sgst_rate"),

  // Totals
  subtotal: real("subtotal"),
  cgstAmount: real("cgst_amount"),
  sgstAmount: real("sgst_amount"),
  totalAmount: real("total_amount"),

  // Additional analytics fields
  discountAmount: real("discount_amount").default(0),
  discountPercentage: real("discount_percentage").default(0),

  // Tracking fields
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  createdBy: text("created_by"), // User who created the invoice

  // Additional fields
  narration: text("narration"),
  termsAndConditions: text("terms_and_conditions"),

  // Customer communication tracking
  emailSent: integer("email_sent").default(0), // Boolean: 0 = false, 1 = true
  emailSentDate: integer("email_sent_date", { mode: "timestamp" }),
  reminderCount: integer("reminder_count").default(0),
  lastReminderDate: integer("last_reminder_date", { mode: "timestamp" }),

  // Financial tracking
  partialPaymentAmount: real("partial_payment_amount").default(0),
  remainingAmount: real("remaining_amount"), // Calculated field

  // Priority and tags
  priority: text("priority").default("normal"), // 'low', 'normal', 'high', 'urgent'
  tags: text("tags"), // JSON string of tags array

  // Notes and follow-up
  internalNotes: text("internal_notes"),
  followUpDate: integer("follow_up_date", { mode: "timestamp" }),

  // Location tracking (for multi-location businesses)
  branchId: text("branch_id"),
  territory: text("territory"),

  // Currency and exchange rate (for international invoices)
  currency: text("currency").default("INR"),
  exchangeRate: real("exchange_rate").default(1.0),
  baseCurrencyAmount: real("base_currency_amount"), // Amount in base currency
});

module.exports = {
  invoices,
};
