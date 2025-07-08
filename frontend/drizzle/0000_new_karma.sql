CREATE TABLE `cases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`user_id` integer NOT NULL,
	`status` text NOT NULL,
	`pages` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_type` text NOT NULL,
	`company_name` text NOT NULL,
	`currency` text NOT NULL,
	`gst_applicable` text NOT NULL,
	`gstin` text,
	`state_code` text,
	`country` text NOT NULL,
	`address_line_1` text NOT NULL,
	`address_line_2` text,
	`state` text NOT NULL,
	`city` text NOT NULL,
	`email` text NOT NULL,
	`contact_no` text NOT NULL,
	`logo_file_name` text,
	`signature_file_name` text,
	`established_year` integer,
	`employee_count` integer,
	`website` text,
	`industry` text,
	`annual_revenue` integer,
	`business_model` text,
	`company_size` text,
	`primary_market` text,
	`customer_segment` text,
	`value_proposition` text,
	`operating_hours` text,
	`timezone` text,
	`linkedin_url` text,
	`facebook_url` text,
	`twitter_url` text,
	`fiscal_year_start` text,
	`tax_id` text,
	`certifications` text,
	`compliance_standards` text
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_type` text NOT NULL,
	`salutation` text,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`pan_number` text,
	`company_name` text NOT NULL,
	`currency` text NOT NULL,
	`gst_applicable` text NOT NULL,
	`gstin` text,
	`state_code` text,
	`billing_country` text NOT NULL,
	`billing_state` text NOT NULL,
	`billing_city` text NOT NULL,
	`billing_address_line_1` text NOT NULL,
	`billing_address_line_2` text,
	`billing_contact_no` text NOT NULL,
	`billing_email` text NOT NULL,
	`billing_alternate_contact_no` text,
	`shipping_country` text NOT NULL,
	`shipping_state` text NOT NULL,
	`shipping_city` text NOT NULL,
	`shipping_address_line_1` text NOT NULL,
	`shipping_address_line_2` text,
	`shipping_contact_no` text NOT NULL,
	`shipping_email` text NOT NULL,
	`shipping_alternate_contact_no` text,
	`relationship_type` text,
	`customer_category` text,
	`customer_size` text,
	`industry` text,
	`account_manager` text,
	`relationship_start_date` text,
	`customer_status` text,
	`credit_limit` integer,
	`payment_terms` text,
	`preferred_payment_method` text,
	`satisfaction_score` integer,
	`risk_rating` text,
	`loyalty_score` integer,
	`acquisition_channel` text,
	`lifetime_value` integer,
	`churn_probability` integer,
	`preferred_contact_method` text,
	`marketing_opt_in` text,
	`notes` text,
	`tags` text,
	`custom_fields` text
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_id` integer NOT NULL,
	`customer_id` integer NOT NULL,
	`invoice_no` text NOT NULL,
	`invoice_date` integer NOT NULL,
	`due_date` integer NOT NULL,
	`terms` text NOT NULL,
	`ledger` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`paid_date` integer,
	`payment_method` text,
	`payment_reference` text,
	`cgst_rate` real,
	`sgst_rate` real,
	`subtotal` real,
	`cgst_amount` real,
	`sgst_amount` real,
	`total_amount` real,
	`discount_amount` real DEFAULT 0,
	`discount_percentage` real DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`narration` text,
	`terms_and_conditions` text,
	`email_sent` integer DEFAULT 0,
	`email_sent_date` integer,
	`reminder_count` integer DEFAULT 0,
	`last_reminder_date` integer,
	`partial_payment_amount` real DEFAULT 0,
	`remaining_amount` real,
	`priority` text DEFAULT 'normal',
	`tags` text,
	`internal_notes` text,
	`follow_up_date` integer,
	`branch_id` text,
	`territory` text,
	`currency` text DEFAULT 'INR',
	`exchange_rate` real DEFAULT 1,
	`base_currency_amount` real,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_invoice_no_unique` ON `invoices` (`invoice_no`);--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`item_details` text NOT NULL,
	`quantity` real NOT NULL,
	`rate` real NOT NULL,
	`amount` real NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE CASCADE,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`hsn_sac_code` text,
	`unit` text,
	`selling_price` real NOT NULL,
	`currency` text DEFAULT 'INR',
	`description` text
);
--> statement-breakpoint
CREATE TABLE `statements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`case_id` integer NOT NULL,
	`account_number` text NOT NULL,
	`customer_name` text NOT NULL,
	`ifsc_code` text,
	`bank_name` text,
	`file_path` text DEFAULT 'downloads' NOT NULL,
	`created_at` integer NOT NULL,
	`start_date` integer,
	`end_date` integer,
	`password` text,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `tally_sales_voucher` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_id` integer NOT NULL,
	`effective_date` integer,
	`bill_reference` text,
	`failed_reason` text,
	`bank_ledger` text NOT NULL,
	`result` integer,
	`created_at` integer DEFAULT 1751960977750 NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tally_sales_voucher_invoice_id_unique` ON `tally_sales_voucher` (`invoice_id`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`statement_id` text NOT NULL,
	`date` integer NOT NULL,
	`description` text NOT NULL,
	`amount` real NOT NULL,
	`category` text NOT NULL,
	`type` text NOT NULL,
	`balance` real NOT NULL,
	`bank` text DEFAULT 'unknown' NOT NULL,
	`entity` text DEFAULT 'unknown' NOT NULL,
	`voucher_type` text DEFAULT 'unknown',
	`created_at` integer DEFAULT 1751960977752 NOT NULL,
	FOREIGN KEY (`statement_id`) REFERENCES `statements`(`id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_name_unique` ON `users` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);