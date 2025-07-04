// src/db/schema.js
const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");

const companies = sqliteTable("companies", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),

  companyType: text("company_type").notNull(), // Manufacturer | Trader | Services
  companyName: text("company_name").notNull(),
  currency: text("currency").notNull(),

  gstApplicable: text("gst_applicable").notNull(), // Yes | No
  gstin: text("gstin"), // Optional, only if gstApplicable === 'Yes'
  stateCode: text("state_code"), // Optional, only if gstApplicable === 'Yes'

  country: text("country").notNull(),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  state: text("state").notNull(),
  city: text("city").notNull(),

  email: text("email").notNull(),
  contactNo: text("contact_no").notNull(),

  // Simple file storage - just store relative paths from uploads folder
  logoFileName: text("logo_file_name"), // e.g., "company_1_logo.png"
  signatureFileName: text("signature_file_name"), // e.g., "company_1_signature.png"

  // Enhanced Analytics Fields
  establishedYear: integer("established_year"),
  employeeCount: integer("employee_count"),
  website: text("website"),
  industry: text("industry"), // Technology, Manufacturing, Services, Healthcare, etc.
  annualRevenue: integer("annual_revenue"), // For better benchmarking
  businessModel: text("business_model"), // B2B, B2C, B2B2C
  companySize: text("company_size"), // Startup, SME, Enterprise

  // Business Intelligence Fields
  primaryMarket: text("primary_market"), // Domestic, International, Both
  customerSegment: text("customer_segment"), // Enterprise, SMB, Consumer
  valueProposition: text("value_proposition"), // Cost Leadership, Differentiation, Focus

  // Operational Details
  operatingHours: text("operating_hours"), // 24/7, Business Hours, Custom
  timezone: text("timezone"),

  // Social and External Links
  linkedinUrl: text("linkedin_url"),
  facebookUrl: text("facebook_url"),
  twitterUrl: text("twitter_url"),

  // Financial Information
  fiscalYearStart: text("fiscal_year_start"), // MM-DD format
  taxId: text("tax_id"),

  // Compliance and Certifications
  certifications: text("certifications"), // JSON string of certifications
  complianceStandards: text("compliance_standards"), // JSON string of standards
});

module.exports = { companies };
