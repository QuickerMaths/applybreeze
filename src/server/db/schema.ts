import {
    pgTable,
    serial,
    varchar,
    text,
    integer,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { applicationStatuses } from "~/constants/applications";
import { jobSources } from "~/constants/jobs";

export const Users = pgTable("Users", {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    username: varchar("username", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const jobSourcesEnum = pgEnum("jobSources", jobSources);

export const Jobs = pgTable("Jobs", {
    id: serial("id").primaryKey().notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    city: varchar("city", { length: 255 }),
    salary: varchar("salary", { length: 255 }).notNull().default("Unknown"),
    country: varchar("country", { length: 255 }),
    source: varchar("source", { length: 255 }).notNull(),
    sourceUrl: varchar("source_url", { length: 1024 }),
    seniorityLevel: varchar("seniority_level", { length: 255 })
        .notNull()
        .default("Unknown"),
    companyName: varchar("company_name", { length: 255 }),
    description: text("description"),
    url: varchar("url", { length: 1024 }),
});

export const applicationStatusEnum = pgEnum(
    "applicationStatus",
    applicationStatuses,
);

export const Applications = pgTable("Applications", {
    id: serial("id").notNull().primaryKey(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => Users.id),
    jobId: integer("job_id")
        .notNull()
        .references(() => Jobs.id),
    status: applicationStatusEnum("applicationStatus").notNull().default("saved"),
    savedAt: timestamp("saved_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    appliedDate: timestamp("applied_date", { withTimezone: true }),
});

export const SavedSearches = pgTable("SavedSearches", {
    id: serial("id").notNull().primaryKey(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => Users.id),
    role: varchar("role", { length: 255 }),
    city: varchar("city", { length: 255 }),
    country: varchar("country", { length: 255 }),
    seniorityLevel: varchar("seniority_level", { length: 255 }),
    savedAt: timestamp("saved_at", { withTimezone: true }).defaultNow(),
});

export const SavedSearchJobs = pgTable("SavedSearchJobs", {
    id: serial("id").notNull().primaryKey(),
    savedSearchId: integer("saved_search_id")
        .notNull()
        .references(() => SavedSearches.id),
    jobId: integer("job_id")
        .notNull()
        .references(() => Jobs.id),
});

export const jobSearchStatusEnum = pgEnum("status", [
    "pending",
    "completed",
    "failed",
]);

export const JobSearchRequest = pgTable("JobSearchRequest", {
    id: serial("id").notNull().primaryKey(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => Users.id),
    savedSearchId: integer("saved_search_id")
        .notNull()
        .references(() => SavedSearches.id),
    status: jobSearchStatusEnum("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const ApplicationsAnalytics = pgTable("ApplicationsAnalytics", {
    id: serial("id").notNull().primaryKey(),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => Users.id),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    savedApplications: integer("saved_applications").notNull().default(0),
    appliedApplications: integer("applied_applications").notNull().default(0),
});

export const userRelations = relations(Users, ({ many }) => ({
    applications: many(Applications),
    savedSearches: many(SavedSearches),
}));

export const jobRelations = relations(Jobs, ({ many }) => ({
    applications: many(Applications),
    savedSearchJobs: many(SavedSearchJobs),
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

export const jobSearchRequestRelations = relations(
    JobSearchRequest,
    ({ one }) => ({
        user: one(Users, {
            fields: [JobSearchRequest.userId],
            references: [Users.id],
        }),
        savedSearch: one(SavedSearches, {
            fields: [JobSearchRequest.savedSearchId],
            references: [SavedSearches.id],
        }),
    }),
);

export const applicationsAnalyticsRelations = relations(
    ApplicationsAnalytics,
    ({ one }) => ({
        user: one(Users, {
            fields: [ApplicationsAnalytics.userId],
            references: [Users.id],
        }),
    }),
);
