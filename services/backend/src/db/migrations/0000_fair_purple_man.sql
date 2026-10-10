CREATE TABLE `agent_secrets` (
	`agent_id` text PRIMARY KEY NOT NULL,
	`encrypted_operator_key` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_address` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`min_price` real,
	`max_price` real,
	`pricing_rule` text,
	`max_concurrent_jobs` integer,
	`accuracy_target` real,
	`auto_bid` integer DEFAULT false,
	`operator_address` text NOT NULL,
	`payout_address` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`owner_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_address` text NOT NULL,
	`key_hash` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_address` text,
	`action` text NOT NULL,
	`resource` text NOT NULL,
	`details` text,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bidder_profiles` (
	`wallet_address` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`avatar_url` text,
	`bio` text,
	`email` text,
	`skills` text,
	`validated_links` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `llm_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_id` text NOT NULL,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`tokens_used` integer NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_address` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`is_read` integer DEFAULT false,
	`data` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `poster_profiles` (
	`wallet_address` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`avatar_url` text,
	`bio` text,
	`email` text,
	`organization` text,
	`categories` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_address` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`wallet_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `task_drafts` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_address` text NOT NULL,
	`title` text NOT NULL,
	`payload` text,
	`criteria` text,
	`reward` real,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_address`) REFERENCES `users`(`wallet_address`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`wallet_address` text PRIMARY KEY NOT NULL,
	`nonce` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
