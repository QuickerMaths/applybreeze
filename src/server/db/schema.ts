import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users Table
export const Users = pgTable('Users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Jobs Table
export const Jobs = pgTable('Jobs', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  city: varchar('city', { length: 255 }),
  salary: varchar('salary', { length: 255 }),
  country: varchar('country', { length: 255 }),
  source: varchar('source', { length: 255 }),
  sourceUrl: varchar('source_url', { length: 1024 }),
  seniorityLevel: varchar('seniority_level', { length: 255 }),
  companyName: varchar('company_name', { length: 255 }),
  description: text('description'),
  url: varchar('url', { length: 1024 }),
});

// JobFilters Table
export const JobFilters = pgTable('JobFilters', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => Users.id),
  title: varchar('title', { length: 255 }),
  city: varchar('city', { length: 255 }),
  state: varchar('state', { length: 255 }),
  country: varchar('country', { length: 255 }),
  seniorityLevel: varchar('seniority_level', { length: 255 }),
  keywords: varchar('keywords', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Applications Table
export const Applications = pgTable('Applications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => Users.id),
  jobId: integer('job_id').references(() => Jobs.id),
  status: varchar('status', { length: 50 }),
  appliedDate: timestamp('applied_date', { withTimezone: true }).defaultNow(),
});

// Relations
export const userRelations = relations(Users, ({ many }) => ({
  jobFilters: many(JobFilters),
  applications: many(Applications),
}));

export const jobRelations = relations(Jobs, ({ many }) => ({
  applications: many(Applications),
}));

export const jobFilterRelations = relations(JobFilters, ({ one }) => ({
  user: one(Users, { fields: [JobFilters.userId], references: [Users.id] }),
}));

export const applicationRelations = relations(Applications, ({ one }) => ({
  user: one(Users, { fields: [Applications.userId], references: [Users.id] }),
  job: one(Jobs, { fields: [Applications.jobId], references: [Jobs.id] }),
}));
