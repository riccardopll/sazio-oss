CREATE TABLE `food_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`user_id` text NOT NULL,
	`food_id` integer NOT NULL,
	`serving_unit_id` integer,
	`quantity` real NOT NULL,
	FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`serving_unit_id`) REFERENCES `serving_units`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "quantity_positive" CHECK("food_logs"."quantity" > 0)
);
--> statement-breakpoint
CREATE INDEX `food_logs_user_date_idx` ON `food_logs` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `foods` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`user_id` text,
	`name` text(50) NOT NULL,
	`serving_size` integer NOT NULL,
	`serving_unit` text NOT NULL,
	`protein` real NOT NULL,
	`carbs` real NOT NULL,
	`fat` real NOT NULL,
	`barcode` text,
	CONSTRAINT "serving_size_positive" CHECK("foods"."serving_size" > 0),
	CONSTRAINT "protein_non_negative" CHECK("foods"."protein" >= 0),
	CONSTRAINT "carbs_non_negative" CHECK("foods"."carbs" >= 0),
	CONSTRAINT "fat_non_negative" CHECK("foods"."fat" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `foods_barcode_unique` ON `foods` (`barcode`);--> statement-breakpoint
CREATE TABLE `serving_units` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`food_id` integer NOT NULL,
	`name` text(50) NOT NULL,
	`grams_equivalent` integer NOT NULL,
	FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "grams_equivalent_positive" CHECK("serving_units"."grams_equivalent" > 0)
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`user_id` text NOT NULL,
	`protein_goal` integer NOT NULL,
	`carbs_goal` integer NOT NULL,
	`fat_goal` integer NOT NULL,
	CONSTRAINT "protein_goal_non_negative" CHECK("user_settings"."protein_goal" >= 0),
	CONSTRAINT "carbs_goal_non_negative" CHECK("user_settings"."carbs_goal" >= 0),
	CONSTRAINT "fat_goal_non_negative" CHECK("user_settings"."fat_goal" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_settings_user_id_unique` ON `user_settings` (`user_id`);