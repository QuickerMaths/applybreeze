"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { db } from "~/server/db";
import {
  Jobs,
  JobSearchRequest,
  SavedSearches,
  SavedSearchJobs,
  Users,
} from "../db/schema";
import type { WebhookEvent, UserJSON } from "@clerk/nextjs/server";
import type { SaveJobSearchParams, SearchJobsParams } from "~/types/indeed";

export async function getSavedSearchFilters(savedSearchId: number) {
  return await db.query.SavedSearches.findFirst({
    where: (savedSearch, { eq }) => eq(savedSearch.id, savedSearchId),
  });
}

export async function getSavedSearchJobs(
  savedSearchId: number,
  cursor?: number,
  pageSize = 10,
) {
  return await db.query.SavedSearchJobs.findMany({
    with: {
      job: {
        columns: {
          title: true,
          city: true,
          country: true,
          source: true,
          companyName: true,
          url: true,
          salary: true,
          seniorityLevel: true,
          sourceUrl: true,
        },
      },
    },
    where: (savedSearchJob, { eq, and, lt }) =>
      and(
        eq(savedSearchJob.savedSearchId, savedSearchId),
        cursor ? lt(savedSearchJob.id, cursor) : undefined,
      ),
    limit: pageSize,
    orderBy: (savedSearchJob, { desc }) => desc(savedSearchJob.id),
  });
}

export async function getSearchResults(
  userId: string,
  cursor?: number,
  pageSize = 10,
) {
  return await db.query.SavedSearches.findMany({
    where: (savedSearch, { eq, and, lt }) =>
      and(
        eq(savedSearch.userId, userId),
        cursor ? lt(savedSearch.id, cursor) : undefined,
      ),
    limit: pageSize,
    orderBy: (savedSearch, { desc }) => desc(savedSearch.id),
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

  await db.delete(SavedSearches).where(eq(SavedSearches.id, searchResultsId));

  if (jobIds.length > 0) {
    await db.delete(Jobs).where(
      inArray(
        Jobs.id,
        jobIds.map((job) => job.jobId),
      ),
    );
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

  await db.delete(Users).where(eq(Users.id, id));
}

export async function saveJobSearchResults({
  jobs,
  userId,
  savedSearchId,
}: SaveJobSearchParams) {
  return await db.transaction(async (tx) => {
    const userExists = await tx
      .select({ id: Users.id })
      .from(Users)
      .where(eq(Users.id, userId))
      .limit(1);

    if (!userExists.length) {
      throw new Error("User not found");
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
      savedSearchId,
      jobId: job.insertedId,
    }));

    await tx.insert(SavedSearchJobs).values(savedSearchJobsToInsert);

    return {
      savedSearchId,
      jobsCount: insertedJobs.length,
    };
  });
}

export async function getSavedSearches(
  userId: string,
  jobsParams: SearchJobsParams,
) {
  return await db.transaction(async (tx) => {
    const searchId = await tx.query.SavedSearches.findFirst({
      where: (savedSearch, { eq, and }) =>
        and(
          eq(savedSearch.userId, userId),
          eq(savedSearch.role, jobsParams.role),
          eq(savedSearch.city, jobsParams.location),
          eq(savedSearch.country, jobsParams.country),
        ),
      columns: {
        id: true,
      },
    });

    if (!searchId) {
      const searchId = await tx
        .insert(SavedSearches)
        .values({
          userId: userId,
          role: jobsParams.role,
          city: jobsParams.location,
          country: jobsParams.country,
          expiresAt: sql`CURRENT_TIMESTAMP + INTERVAL '3 DAYS'`,
          isExtended: false,
          savedAt: sql`CURRENT_TIMESTAMP`,
        })
        .returning({ id: SavedSearches.id });

      if (!searchId[0]?.id) {
        throw new Error("Could not save search");
      }

      return searchId[0].id;
    }

    return searchId.id;
  });
}

export async function createSearchRequest(
  savedSearchId: number,
  userId: string,
) {
  const request = await db
    .insert(JobSearchRequest)
    .values({
      userId,
      savedSearchId,
      status: "pending",
      expiresAt: sql`CURRENT_TIMESTAMP + INTERVAL '30 MINUTES'`,
      createdAt: sql`CURRENT_TIMESTAMP`,
    })
    .returning({ id: JobSearchRequest.id });

  if (!request[0]?.id) {
    throw new Error("Could not create search request");
  }

  return request[0].id;
}

export async function updateSearchRequestStatus(
  requestId: number,
  status: "completed" | "failed",
) {
  return await db
    .update(JobSearchRequest)
    .set({
      status,
    })
    .where(eq(JobSearchRequest.id, requestId));
}

export async function getRequests(userId: string) {
  return await db.query.JobSearchRequest.findMany({
    where: (request, { eq }) => eq(request.userId, userId),
    with: {
      savedSearch: {
        columns: {
          role: true,
          city: true,
          country: true,
        },
      },
    },
  });
}

export async function getPendingRequests(userId: string) {
  return await db.query.JobSearchRequest.findMany({
    where: (request, { eq, and }) =>
      and(eq(request.userId, userId), eq(request.status, "pending")),
    with: {
      savedSearch: {
        columns: {
          role: true,
          city: true,
          country: true,
        },
      },
    },
  });
}

export async function completeRequest(requestId: number) {
  await db.delete(JobSearchRequest).where(eq(JobSearchRequest.id, requestId));
}

export async function deleteExpiredRequests() {
  await db
    .delete(JobSearchRequest)
    .where(
      sql`expires_at < CURRENT_TIMESTAMP AND status = 'pending' OR status = 'failed'`,
    );
}
