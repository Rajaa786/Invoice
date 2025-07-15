// src/db/schema.js
const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");

const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),

  customerType: text("customer_type").notNull(),    // 'Business' | 'Individual'
  salutation: text("salutation"),                   // Mr. | Mrs. | Ms. etc.
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  panNumber: text("pan_number"),                    // Optional

  companyName: text("company_name").notNull(),
  currency: text("currency").notNull(),

  gstApplicable: text("gst_applicable").notNull(),  // 'Yes' | 'No'
  gstin: text("gstin"),                             // Required if gstApplicable === 'Yes'
  stateCode: text("state_code"),                    // Required if gstApplicable === 'Yes'

  // Billing Address
  billingCountry: text("billing_country").notNull(),
  billingState: text("billing_state").notNull(),
  billingCity: text("billing_city").notNull(),
  billingZip: text("billing_zip"), // Added zip/postal code for billing address
  billingAddressLine1: text("billing_address_line_1").notNull(),
  billingAddressLine2: text("billing_address_line_2"),
  billingContactNo: text("billing_contact_no").notNull(),
  billingEmail: text("billing_email").notNull(),
  billingAlternateContactNo: text("billing_alternate_contact_no"),

  // Shipping Address
  shippingCountry: text("shipping_country").notNull(),
  shippingState: text("shipping_state").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingZip: text("shipping_zip"), // Added zip/postal code for shipping address
  shippingAddressLine1: text("shipping_address_line_1").notNull(),
  shippingAddressLine2: text("shipping_address_line_2"),
  shippingContactNo: text("shipping_contact_no").notNull(),
  shippingEmail: text("shipping_email").notNull(),
  shippingAlternateContactNo: text("shipping_alternate_contact_no"),

  // Enhanced Analytics Fields
  relationshipType: text("relationship_type"), // 'recurring', 'one-time', 'seasonal', 'project-based'
  customerCategory: text("customer_category"), // 'premium', 'standard', 'basic'
  customerSize: text("customer_size"), // 'enterprise', 'mid-market', 'small'
  industry: text("industry"), // Customer's industry for segmentation

  // Business Relationship
  accountManager: text("account_manager"), // Who manages this account
  relationshipStartDate: text("relationship_start_date"), // When did business relationship start
  customerStatus: text("customer_status"), // 'active', 'inactive', 'prospect', 'churned'

  // Financial Details
  creditLimit: integer("credit_limit"),
  paymentTerms: text("payment_terms"), // 'net_30', 'net_15', 'immediate', etc.
  preferredPaymentMethod: text("preferred_payment_method"),

  // Analytics and Scoring
  satisfactionScore: integer("satisfaction_score"), // 1-5 scale
  riskRating: text("risk_rating"), // 'low', 'medium', 'high'
  loyaltyScore: integer("loyalty_score"), // 1-100 scale

  // Business Intelligence
  acquisitionChannel: text("acquisition_channel"), // 'referral', 'marketing', 'cold_call', etc.
  lifetimeValue: integer("lifetime_value"), // Calculated or estimated
  churnProbability: integer("churn_probability"), // 0-100 percentage

  // Communication Preferences
  preferredContactMethod: text("preferred_contact_method"), // 'email', 'phone', 'sms'
  marketingOptIn: text("marketing_opt_in"), // 'yes', 'no'

  // Additional Metadata
  notes: text("notes"), // Free text notes about customer
  tags: text("tags"), // JSON array of tags for categorization
  customFields: text("custom_fields"), // JSON object for extensibility
});

module.exports = { customers };
