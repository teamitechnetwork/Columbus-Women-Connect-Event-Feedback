import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const feedbackTable = pgTable("event_feedback", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 120 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  organization: varchar("organization", { length: 120 }),
  overallRating: integer("overall_rating").notNull(),
  mostValuable: text("most_valuable"),
  improvements: text("improvements"),
  futureTopics: text("future_topics"),
  contactRequested: boolean("contact_requested").notNull(),
  futureUpdates: boolean("future_updates").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
