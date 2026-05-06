import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const eventStatus = pgEnum("event_status", [
  "pending",
  "approved",
  "rejected",
]);

export const eventSource = pgEnum("event_source", [
  "funcheap",
  "eventbrite",
  "ticketmaster",
  "luma",
  "venues",
  "manual",
  "submission",
]);

export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    topics: text("topics").array().notNull().default([]),
    areas: text("areas").array().notNull().default([]),
    confirmed: boolean("confirmed").notNull().default(true),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({ emailIdx: uniqueIndex("subscribers_email_idx").on(t.email) }),
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    url: text("url").notNull(),
    venue: text("venue"),
    area: text("area"),
    city: text("city"),
    topics: text("topics").array().notNull().default([]),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    isOnline: boolean("is_online").notNull().default(false),
    imageUrl: text("image_url"),
    source: eventSource("source").notNull(),
    sourceId: text("source_id"),
    status: eventStatus("status").notNull().default("approved"),
    submitterEmail: text("submitter_email"),
    discoveredAt: timestamp("discovered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    sourceUniq: uniqueIndex("events_source_sourceid_idx").on(t.source, t.sourceId),
    discoveredIdx: index("events_discovered_idx").on(t.discoveredAt),
    startsIdx: index("events_starts_idx").on(t.startsAt),
    statusIdx: index("events_status_idx").on(t.status),
  }),
);

export const digestLog = pgTable("digest_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriberId: uuid("subscriber_id").notNull().references(() => subscribers.id),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  eventCount: text("event_count").notNull(),
});

export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
