CREATE TYPE "public"."event_source" AS ENUM('funcheap', 'eventbrite', 'ticketmaster', 'luma', 'manual', 'submission');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "digest_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscriber_id" uuid NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_count" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"venue" text,
	"area" text,
	"city" text,
	"topics" text[] DEFAULT '{}' NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"is_online" boolean DEFAULT false NOT NULL,
	"image_url" text,
	"source" "event_source" NOT NULL,
	"source_id" text,
	"status" "event_status" DEFAULT 'approved' NOT NULL,
	"submitter_email" text,
	"discovered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"topics" text[] DEFAULT '{}' NOT NULL,
	"areas" text[] DEFAULT '{}' NOT NULL,
	"confirmed" boolean DEFAULT true NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "digest_log" ADD CONSTRAINT "digest_log_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "events_source_sourceid_idx" ON "events" USING btree ("source","source_id");--> statement-breakpoint
CREATE INDEX "events_discovered_idx" ON "events" USING btree ("discovered_at");--> statement-breakpoint
CREATE INDEX "events_starts_idx" ON "events" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "events_status_idx" ON "events" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "subscribers_email_idx" ON "subscribers" USING btree ("email");