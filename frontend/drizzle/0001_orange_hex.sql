PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tally_voucher` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transaction_id` integer NOT NULL,
	`effective_date` integer,
	`bill_reference` text,
	`failed_reason` text,
	`bank_ledger` text NOT NULL,
	`result` integer,
	`created_at` integer DEFAULT 1750598884764 NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_tally_voucher`("id", "transaction_id", "effective_date", "bill_reference", "failed_reason", "bank_ledger", "result", "created_at") SELECT "id", "transaction_id", "effective_date", "bill_reference", "failed_reason", "bank_ledger", "result", "created_at" FROM `tally_voucher`;--> statement-breakpoint
DROP TABLE `tally_voucher`;--> statement-breakpoint
ALTER TABLE `__new_tally_voucher` RENAME TO `tally_voucher`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `tally_voucher_transaction_id_unique` ON `tally_voucher` (`transaction_id`);--> statement-breakpoint
CREATE TABLE `__new_transactions` (
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
	`created_at` integer DEFAULT 1750598884764 NOT NULL,
	FOREIGN KEY (`statement_id`) REFERENCES `statements`(`id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "statement_id", "date", "description", "amount", "category", "type", "balance", "bank", "entity", "voucher_type", "created_at") SELECT "id", "statement_id", "date", "description", "amount", "category", "type", "balance", "bank", "entity", "voucher_type", "created_at" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;--> statement-breakpoint
ALTER TABLE `companies` ADD `established_year` integer;--> statement-breakpoint
ALTER TABLE `companies` ADD `employee_count` integer;--> statement-breakpoint
ALTER TABLE `companies` ADD `website` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `industry` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `annual_revenue` integer;--> statement-breakpoint
ALTER TABLE `companies` ADD `business_model` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `company_size` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `primary_market` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `customer_segment` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `value_proposition` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `operating_hours` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `timezone` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `linkedin_url` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `facebook_url` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `twitter_url` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `fiscal_year_start` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `tax_id` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `certifications` text;--> statement-breakpoint
ALTER TABLE `companies` ADD `compliance_standards` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `relationship_type` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `customer_category` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `customer_size` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `industry` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `account_manager` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `relationship_start_date` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `customer_status` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `credit_limit` integer;--> statement-breakpoint
ALTER TABLE `customers` ADD `payment_terms` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `preferred_payment_method` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `satisfaction_score` integer;--> statement-breakpoint
ALTER TABLE `customers` ADD `risk_rating` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `loyalty_score` integer;--> statement-breakpoint
ALTER TABLE `customers` ADD `acquisition_channel` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `lifetime_value` integer;--> statement-breakpoint
ALTER TABLE `customers` ADD `churn_probability` integer;--> statement-breakpoint
ALTER TABLE `customers` ADD `preferred_contact_method` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `marketing_opt_in` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `custom_fields` text;