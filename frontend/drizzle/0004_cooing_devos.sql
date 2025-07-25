CREATE TABLE `cities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`state_id` integer NOT NULL,
	`created_at` integer DEFAULT 1753370210306 NOT NULL,
	`updated_at` integer DEFAULT 1753370210306 NOT NULL,
	FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `states` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`country` text DEFAULT 'India' NOT NULL,
	`created_at` integer DEFAULT 1753370210306 NOT NULL,
	`updated_at` integer DEFAULT 1753370210306 NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tally_sales_voucher` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_id` integer NOT NULL,
	`effective_date` integer,
	`bill_reference` text,
	`failed_reason` text,
	`bank_ledger` text NOT NULL,
	`result` integer,
	`created_at` integer DEFAULT 1753370210321 NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_tally_sales_voucher`("id", "invoice_id", "effective_date", "bill_reference", "failed_reason", "bank_ledger", "result", "created_at") SELECT "id", "invoice_id", "effective_date", "bill_reference", "failed_reason", "bank_ledger", "result", "created_at" FROM `tally_sales_voucher`;--> statement-breakpoint
DROP TABLE `tally_sales_voucher`;--> statement-breakpoint
ALTER TABLE `__new_tally_sales_voucher` RENAME TO `tally_sales_voucher`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
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
	`created_at` integer DEFAULT 1753370210322 NOT NULL,
	FOREIGN KEY (`statement_id`) REFERENCES `statements`(`id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "statement_id", "date", "description", "amount", "category", "type", "balance", "bank", "entity", "voucher_type", "created_at") SELECT "id", "statement_id", "date", "description", "amount", "category", "type", "balance", "bank", "entity", "voucher_type", "created_at" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;--> statement-breakpoint
ALTER TABLE `banks` ADD `account_type` text DEFAULT 'savings';--> statement-breakpoint
ALTER TABLE `companies` ADD `pincode` text;