"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { db } from "~/server/db";
import {
  JobFilters,
  Jobs,
  SavedSearches,
  SavedSearchJobs,
  Users,
} from "../db/schema";
import type { WebhookEvent, UserJSON } from "@clerk/nextjs/server";
import type { SaveJobSearchParams } from "~/types/indeed";

export async function getSearchResults(userId: string) {
  return await db.query.SavedSearches.findMany({
    where: (savedSearch, { eq }) => eq(savedSearch.userId, userId),
    with: {
      jobFilter: {
        columns: {
          role: true,
          city: true,
          country: true,
        },
      },
    },
  });
}

export async function deleteSearchResults(searchResultsId: number) {
  const jobIds = await db
    .select({ jobId: SavedSearchJobs.jobId })
    .from(SavedSearchJobs)
    .where(eq(SavedSearchJobs.savedSearchId, searchResultsId));

  await db
    .delete(SavedSearchJobs)
    .where(eq(SavedSearchJobs.savedSearchId, searchResultsId));

  const deletedSearch = await db
    .delete(SavedSearches)
    .where(eq(SavedSearches.id, searchResultsId))
    .returning({ jobFilterId: SavedSearches.jobFilterId });

  if (jobIds.length > 0) {
    await db.delete(Jobs).where(
      inArray(
        Jobs.id,
        jobIds.map((job) => job.jobId),
      ),
    );
  }

  if (deletedSearch.length > 0 && deletedSearch[0]?.jobFilterId) {
    await db
      .delete(JobFilters)
      .where(eq(JobFilters.id, deletedSearch[0].jobFilterId));
  }
}

export async function saveUser(payload: WebhookEvent) {
  const user = payload.data as UserJSON;

  const email = user.email_addresses.find(
    (email) => email.id === user.primary_email_address_id,
  );

  if (!email) {
    return;
  }

  await db.insert(Users).values({
    id: user.id,
    email: email.email_address,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username ?? null,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at),
  });
}

export async function updateUser(payload: WebhookEvent, id: string) {
  const user = payload.data as UserJSON;

  const email = user.email_addresses.find(
    (email) => email.id === user.primary_email_address_id,
  );

  if (!email) {
    return;
  }

  await db
    .update(Users)
    .set({
      id: user.id,
      email: email.email_address,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username ?? null,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    })
    .where(eq(Users.id, id));
}

export async function deleteUser(id: string) {
  const savedSearchId = await db
    .select({ id: SavedSearches.id })
    .from(SavedSearches)
    .where(eq(SavedSearches.userId, id));

  if (!savedSearchId[0]?.id) return;

  const jobIds = await db
    .select({ jobId: SavedSearchJobs.jobId })
    .from(SavedSearchJobs)
    .where(eq(SavedSearchJobs.savedSearchId, savedSearchId[0].id));

  await db
    .delete(SavedSearchJobs)
    .where(eq(SavedSearchJobs.savedSearchId, savedSearchId[0].id));

  if (jobIds.length > 0) {
    await db.delete(Jobs).where(
      inArray(
        Jobs.id,
        jobIds.map((job) => job.jobId),
      ),
    );
  }

  await db
    .delete(SavedSearches)
    .where(eq(SavedSearches.userId, id))
    .returning({ id: SavedSearches.id });

  await db.delete(JobFilters).where(eq(JobFilters.userId, id));

  await db.delete(Users).where(eq(Users.id, id));
}

export async function saveJobSearchResults({
  jobs,
  userId,
  searchCriteria,
}: SaveJobSearchParams) {
  return await db.transaction(async (tx) => {
    const jobFilter = await tx
      .insert(JobFilters)
      .values({
        userId: userId,
        role: searchCriteria.role,
        city: searchCriteria.location,
        country: searchCriteria.country,
        createdAt: sql`CURRENT_TIMESTAMP`,
      })
      .returning({ jobFilterId: JobFilters.id });

    if (!jobFilter[0]?.jobFilterId) {
      throw new Error("Failed to save job filter");
    }

    const savedSearch = await tx
      .insert(SavedSearches)
      .values({
        userId: userId,
        jobFilterId: jobFilter[0]?.jobFilterId,
        expiresAt: sql`CURRENT_TIMESTAMP + INTERVAL '3 days'`,
      })
      .returning({ savedSearchId: SavedSearches.id });

    if (!savedSearch[0]?.savedSearchId) {
      throw new Error("Failed to save search");
    }

    const jobsToInsert = jobs.map((job) => ({
      title: job.positionName,
      city: job.location,
      source: "indeed",
      companyName: job.company,
      description: job.description,
      url: job.externalApplyLink ?? job.url,
      salary: job.salary,
      country: job.searchInput.country,
      seniorityLevel: "unknown",
      sourceUrl: job.url,
    }));

    const insertedJobs = await tx
      .insert(Jobs)
      .values(jobsToInsert)
      .returning({ insertedId: Jobs.id });

    const savedSearchJobsToInsert = insertedJobs.map((job) => ({
      savedSearchId: savedSearch[0].savedSearchId,
      jobId: job.insertedId,
    }));

    await tx.insert(SavedSearchJobs).values(savedSearchJobsToInsert);

    return {
      jobFilterId: jobFilter[0].jobFilterId,
      savedSearchId: savedSearch[0].savedSearchId,
      jobsCount: insertedJobs.length,
    };
  });
}
