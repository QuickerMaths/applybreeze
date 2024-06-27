import {
    pgTableCreator,
    pgTable,
    serial,
    varchar,
    integer,
    text,
    date,
    timestamp,
    pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const createTable = pgTableCreator((name) => `applybreeze_${name}`);

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
    titleId: integer('title_id').references(() => JobTitles.id),
        locationId: integer('location_id').references(() => JobLocations.id),
        sourceId: integer('source_id').references(() => JobSources.id),
        seniorityLevelId: integer('seniority_level_id').references(() => JobSeniorityLevels.id),
        companyId: integer('company_id').references(() => Companies.id),
        description: text('description'),
    postedDate: date('posted_date'),
    url: varchar('url', { length: 1024 }),
});

// JobFilters Table
export const JobFilters = pgTable('JobFilters', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => Users.id),
        titleId: integer('title_id').references(() => JobTitles.id),
        locationId: integer('location_id').references(() => JobLocations.id),
        seniorityLevelId: integer('seniority_level_id').references(() => JobSeniorityLevels.id),
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

// JobLocations Table
export const JobLocations = pgTable('JobLocations', {
    id: serial('id').primaryKey(),
    city: varchar('city', { length: 255 }),
    state: varchar('state', { length: 255 }),
    country: varchar('country', { length: 255 }),
});

export const jobSourcesEnum = pgEnum('name', ['indeed', 'linkedin']);

// JobSources Table
export const JobSources = pgTable('JobSources', {
    id: serial('id').primaryKey(),
    name: jobSourcesEnum('name'),
    url: varchar('url', { length: 1024 }),
});

// JobTitles Table
export const JobTitles = pgTable('JobTitles', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }),
});

export const seniorityLevelsEnum = pgEnum('level', ['intern', 'trainee', 'junior', 'entry', 'mid', 'senior']);

// JobSeniorityLevels Table
export const JobSeniorityLevels = pgTable('JobSeniorityLevels', {
    id: serial('id').primaryKey(),
    level: seniorityLevelsEnum('level'),
});

// Companies Table
export const Companies = pgTable('Companies', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    website: varchar('website', { length: 255 }),
});

// CompanyLocations Table
export const CompanyLocations = pgTable('CompanyLocations', {
    id: serial('id').primaryKey(),
    companyId: integer('company_id').references(() => Companies.id),
        locationId: integer('location_id').references(() => JobLocations.id),
});

    // Relations
    export const userRelations = relations(Users, ({ many }) => ({
        jobFilters: many(JobFilters),
        applications: many(Applications),
    }));

    export const jobRelations = relations(Jobs, ({ one, many }) => ({
        title: one(JobTitles, { fields: [Jobs.titleId], references: [JobTitles.id] }),
        location: one(JobLocations, { fields: [Jobs.locationId], references: [JobLocations.id] }),
        source: one(JobSources, { fields: [Jobs.sourceId], references: [JobSources.id] }),
        seniorityLevel: one(JobSeniorityLevels, { fields: [Jobs.seniorityLevelId], references: [JobSeniorityLevels.id] }),
        company: one(Companies, { fields: [Jobs.companyId], references: [Companies.id] }),
        applications: many(Applications),
    }));

    export const jobFilterRelations = relations(JobFilters, ({ one }) => ({
        user: one(Users, { fields: [JobFilters.userId], references: [Users.id] }),
        title: one(JobTitles, { fields: [JobFilters.titleId], references: [JobTitles.id] }),
        location: one(JobLocations, { fields: [JobFilters.locationId], references: [JobLocations.id] }),
        seniorityLevel: one(JobSeniorityLevels, { fields: [JobFilters.seniorityLevelId], references: [JobSeniorityLevels.id] }),
    }));

    export const applicationRelations = relations(Applications, ({ one }) => ({
        user: one(Users, { fields: [Applications.userId], references: [Users.id] }),
        job: one(Jobs, { fields: [Applications.jobId], references: [Jobs.id] }),
    }));

    export const companyRelations = relations(Companies, ({ many }) => ({
        jobs: many(Jobs),
        locations: many(CompanyLocations),
    }));

    export const companyLocationRelations = relations(CompanyLocations, ({ one }) => ({
        company: one(Companies, { fields: [CompanyLocations.companyId], references: [Companies.id] }),
        location: one(JobLocations, { fields: [CompanyLocations.locationId], references: [JobLocations.id] }),
    }));

    export const jobLocationRelations = relations(JobLocations, ({ many }) => ({
        jobs: many(Jobs),
        companyLocations: many(CompanyLocations),
    }));

    export const jobSourceRelations = relations(JobSources, ({ many }) => ({
        jobs: many(Jobs),
    }));

    export const jobTitleRelations = relations(JobTitles, ({ many }) => ({
        jobs: many(Jobs),
        jobFilters: many(JobFilters),
    }));

    export const jobSeniorityLevelRelations = relations(JobSeniorityLevels, ({ many }) => ({
        jobs: many(Jobs),
        jobFilters: many(JobFilters),
    }));
