"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { db } from "~/server/db";
import {
  Applications,
  Jobs,
  SavedSearches,
  SavedSearchJobs,
  Users,
} from "../db/schema";
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
          id: true,
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

export async function getSavedSearchJobsTitles(
  savedSearchId: number,
  cursor?: number,
  pageSize = 10,
) {
  return await db.query.SavedSearchJobs.findMany({
    with: {
      job: {
        columns: {
          id: true,
          title: true,
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

export async function saveJobs({
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

    const insertedJobs = [];
    for (const job of jobs) {
      try {
        const jobToInsert = {
          title: job.positionName,
          city: job.location,
          source: "indeed",
          companyName: job.company,
          description: job.descriptionHTML,
          url: job.externalApplyLink ?? job.url,
          salary: job.salary,
          country: job.searchInput.country,
          seniorityLevel: "unknown",
          sourceUrl: job.url,
        };

        const [insertedJob] = await tx
          .insert(Jobs)
          .values(jobToInsert)
          .returning({ insertedId: Jobs.id });

        insertedJobs.push(insertedJob);

        if (!insertedJob?.insertedId) {
          throw new Error("Could not insert job");
        }

        await tx.insert(Applications).values({
          userId,
          jobId: insertedJob.insertedId,
        });

        await tx.insert(SavedSearchJobs).values({
          savedSearchId,
          jobId: insertedJob.insertedId,
        });
      } catch (error) {
        console.error(`Error inserting job ${job.positionName}:`, error);
      }
    }

    return {
      savedSearchId,
      jobsCount: insertedJobs.length,
    };
  });
}

export async function getSavedSearchId(
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

export async function getJob(jobId: number) {
  return await db.query.Jobs.findFirst({
    where: (job, { eq }) => eq(job.id, jobId),
  });
}
