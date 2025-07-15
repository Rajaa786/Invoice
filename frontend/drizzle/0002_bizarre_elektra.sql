PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_id` integer NOT NULL,
	`customer_id` integer NOT NULL,
	`invoice_no` text NOT NULL,
	`invoice_date` integer NOT NULL,
	`due_date` integer NOT NULL,
	`terms` text NOT NULL,
	`ledger` text,
	`invoice_type` text DEFAULT 'tax' NOT NULL,
	`converted_from_id` integer,
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
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE CASCADE,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE CASCADE,
	FOREIGN KEY (`converted_from_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE SET NULL
);
--> statement-breakpoint
INSERT INTO `__new_invoices`("id", "company_id", "customer_id", "invoice_no", "invoice_date", "due_date", "terms", "ledger", "invoice_type", "converted_from_id", "status", "paid_date", "payment_method", "payment_reference", "cgst_rate", "sgst_rate", "subtotal", "cgst_amount", "sgst_amount", "total_amount", "discount_amount", "discount_percentage", "created_at", "updated_at", "created_by", "narration", "terms_and_conditions", "email_sent", "email_sent_date", "reminder_count", "last_reminder_date", "partial_payment_amount", "remaining_amount", "priority", "tags", "internal_notes", "follow_up_date", "branch_id", "territory", "currency", "exchange_rate", "base_currency_amount") SELECT "id", "company_id", "customer_id", "invoice_no", "invoice_date", "due_date", "terms", "ledger", "invoice_type", "converted_from_id", "status", "paid_date", "payment_method", "payment_reference", "cgst_rate", "sgst_rate", "subtotal", "cgst_amount", "sgst_amount", "total_amount", "discount_amount", "discount_percentage", "created_at", "updated_at", "created_by", "narration", "terms_and_conditions", "email_sent", "email_sent_date", "reminder_count", "last_reminder_date", "partial_payment_amount", "remaining_amount", "priority", "tags", "internal_notes", "follow_up_date", "branch_id", "territory", "currency", "exchange_rate", "base_currency_amount" FROM `invoices`;--> statement-breakpoint
DROP TABLE `invoices`;--> statement-breakpoint
ALTER TABLE `__new_invoices` RENAME TO `invoices`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_invoice_no_unique` ON `invoices` (`invoice_no`);--> statement-breakpoint
CREATE TABLE `__new_tally_sales_voucher` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_id` integer NOT NULL,
	`effective_date` integer,
	`bill_reference` text,
	`failed_reason` text,
	`bank_ledger` text NOT NULL,
	`result` integer,
	`created_at` integer DEFAULT 1752590792669 NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_tally_sales_voucher`("id", "invoice_id", "effective_date", "bill_reference", "failed_reason", "bank_ledger", "result", "created_at") SELECT "id", "invoice_id", "effective_date", "bill_reference", "failed_reason", "bank_ledger", "result", "created_at" FROM `tally_sales_voucher`;--> statement-breakpoint
DROP TABLE `tally_sales_voucher`;--> statement-breakpoint
ALTER TABLE `__new_tally_sales_voucher` RENAME TO `tally_sales_voucher`;--> statement-breakpoint
CREATE UNIQUE INDEX `tally_sales_voucher_invoice_id_unique` ON `tally_sales_voucher` (`invoice_id`);--> statement-breakpoint
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
	`created_at` integer DEFAULT 1752590792678 NOT NULL,
	FOREIGN KEY (`statement_id`) REFERENCES `statements`(`id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "statement_id", "date", "description", "amount", "category", "type", "balance", "bank", "entity", "voucher_type", "created_at") SELECT "id", "statement_id", "date", "description", "amount", "category", "type", "balance", "bank", "entity", "voucher_type", "created_at" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;--> statement-breakpoint
ALTER TABLE `customers` ADD `billing_zip` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `shipping_zip` text;