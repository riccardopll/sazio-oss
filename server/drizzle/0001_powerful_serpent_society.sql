PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now') * 1000) NOT NULL,
	`user_id` text NOT NULL,
	`name` text(100) NOT NULL,
	`start_at` integer NOT NULL,
	`end_at` integer,
	`protein_goal` integer NOT NULL,
	`carbs_goal` integer NOT NULL,
	`fat_goal` integer NOT NULL,
	CONSTRAINT "protein_goal_non_negative" CHECK("__new_goals"."protein_goal" >= 0),
	CONSTRAINT "carbs_goal_non_negative" CHECK("__new_goals"."carbs_goal" >= 0),
	CONSTRAINT "fat_goal_non_negative" CHECK("__new_goals"."fat_goal" >= 0),
	CONSTRAINT "start_before_end" CHECK("__new_goals"."end_at" IS NULL OR "__new_goals"."start_at" < "__new_goals"."end_at")
);
--> statement-breakpoint
INSERT INTO `__new_goals`("id", "created_at", "updated_at", "user_id", "name", "start_at", "end_at", "protein_goal", "carbs_goal", "fat_goal") SELECT "id", "created_at", "updated_at", "user_id", "name", "start_at", "end_at", "protein_goal", "carbs_goal", "fat_goal" FROM `goals`;--> statement-breakpoint
DROP TABLE `goals`;--> statement-breakpoint
ALTER TABLE `__new_goals` RENAME TO `goals`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `goals_user_id_idx` ON `goals` (`user_id`);--> statement-breakpoint
CREATE INDEX `goals_user_date_idx` ON `goals` (`user_id`,`start_at`,`end_at`);