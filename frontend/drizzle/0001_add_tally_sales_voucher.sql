CREATE TABLE `tally_sales_voucher` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_id` integer NOT NULL,
	`effective_date` integer,
	`voucher_number` text,
	`failed_reason` text,
	`result` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tally_sales_voucher_invoice_id_unique` ON `tally_sales_voucher` (`invoice_id`); 