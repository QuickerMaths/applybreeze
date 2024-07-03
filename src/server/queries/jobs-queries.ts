"use server";

import { eq, inArray } from "drizzle-orm";
import { db } from "~/server/db";
import { JobFilters, Jobs, SavedSearches, SavedSearchJobs } from "../db/schema";

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
