import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users Table (unchanged)
export const Users = pgTable("Users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Jobs Table (unchanged)
export const Jobs = pgTable("Jobs", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }),
  salary: varchar("salary", { length: 255 }),
  country: varchar("country", { length: 255 }),
  source: varchar("source", { length: 255 }),
  sourceUrl: varchar("source_url", { length: 1024 }),
  seniorityLevel: varchar("seniority_level", { length: 255 }),
  companyName: varchar("company_name", { length: 255 }),
  description: text("description"),
  url: varchar("url", { length: 1024 }),
});

// JobFilters Table (unchanged)
export const JobFilters = pgTable("JobFilters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => Users.id),
  title: varchar("title", { length: 255 }),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 255 }),
  country: varchar("country", { length: 255 }),
  seniorityLevel: varchar("seniority_level", { length: 255 }),
  keywords: varchar("keywords", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Applications Table (unchanged)
export const Applications = pgTable("Applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => Users.id),
  jobId: integer("job_id").references(() => Jobs.id),
  status: varchar("status", { length: 50 }),
  appliedDate: timestamp("applied_date", { withTimezone: true }).defaultNow(),
});

// Updated: SavedSearches
export const SavedSearches = pgTable("SavedSearches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => Users.id),
  jobFilterId: integer("job_filter_id").references(() => JobFilters.id), // New field
  savedAt: timestamp("saved_at", { withTimezone: true }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  isExtended: boolean("is_extended").default(false),
});

// SavedSearchJobs (junction table, unchanged)
export const SavedSearchJobs = pgTable("SavedSearchJobs", {
  id: serial("id").primaryKey(),
  savedSearchId: integer("saved_search_id").references(() => SavedSearches.id),
  jobId: integer("job_id").references(() => Jobs.id),
});

// Relations
export const userRelations = relations(Users, ({ many }) => ({
  jobFilters: many(JobFilters),
  applications: many(Applications),
  savedSearches: many(SavedSearches),
}));

export const jobRelations = relations(Jobs, ({ many }) => ({
  applications: many(Applications),
  savedSearchJobs: many(SavedSearchJobs),
}));

export const jobFilterRelations = relations(JobFilters, ({ one, many }) => ({
  user: one(Users, { fields: [JobFilters.userId], references: [Users.id] }),
  savedSearches: many(SavedSearches),
}));

export const applicationRelations = relations(Applications, ({ one }) => ({
  user: one(Users, { fields: [Applications.userId], references: [Users.id] }),
  job: one(Jobs, { fields: [Applications.jobId], references: [Jobs.id] }),
}));

export const savedSearchRelations = relations(
  SavedSearches,
  ({ one, many }) => ({
    user: one(Users, {
      fields: [SavedSearches.userId],
      references: [Users.id],
    }),
    jobFilter: one(JobFilters, {
      fields: [SavedSearches.jobFilterId],
      references: [JobFilters.id],
    }),
    savedSearchJobs: many(SavedSearchJobs),
  }),
);

export const savedSearchJobRelations = relations(
  SavedSearchJobs,
  ({ one }) => ({
    savedSearch: one(SavedSearches, {
      fields: [SavedSearchJobs.savedSearchId],
      references: [SavedSearches.id],
    }),
    job: one(Jobs, { fields: [SavedSearchJobs.jobId], references: [Jobs.id] }),
  }),
);
