"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "~/server/db";
import {
  Applications,
  Jobs,
  SavedSearches,
  SavedSearchJobs,
  Users,
} from "../db/schema";
import type { SaveJobSearchParams, SearchJobsParams } from "~/types/indeed";

export async function getAllJobs(
  userId: string,
  cursor?: number,
  pageSize = 10,
) {
  const jobs = await db.query.Jobs.findMany({
    with: {
      applications: {
        where: (application, { eq }) => eq(application.userId, userId),
        limit: 1,
      },
    },
    where: (job, { lt }) => (cursor ? lt(job.id, cursor) : undefined),
    limit: pageSize,
    orderBy: (job, { desc }) => desc(job.id),
  });

  return jobs.map((job) => {
    return {
      ...job,
      applications: job.applications[0],
    };
  });
}

export async function getSavedSearchJobsTitles(cursor?: number, pageSize = 10) {
  return await db.query.SavedSearchJobs.findMany({
    with: {
      job: {
        columns: {
          id: true,
          title: true,
        },
      },
    },
    where: (savedSearchJob, { lt }) =>
      cursor ? lt(savedSearchJob.id, cursor) : undefined,
    limit: pageSize,
    orderBy: (savedSearchJob, { desc }) => desc(savedSearchJob.id),
  });
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
          salary: job.salary ?? "Unknown",
          country: job.searchInput.country,
          seniorityLevel: "Unknown",
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

export async function deleteJob(jobId: number) {
  await db.delete(SavedSearchJobs).where(eq(SavedSearchJobs.jobId, jobId));
  await db.delete(Applications).where(eq(Applications.jobId, jobId));
  await db.delete(Jobs).where(eq(Jobs.id, jobId));
}
