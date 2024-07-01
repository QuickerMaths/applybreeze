import { ApifyClient } from "apify-client";
import { validateJobs } from "~/lib/validateJobs";
import type { IndeedJob } from "~/types/indeed";
import { db } from "~/server/db";
import { validateQueryParams } from "~/lib/validateQueryParams";
import {
  JobFilters,
  Jobs,
  SavedSearches,
  SavedSearchJobs,
} from "~/server/db/schema";
import { indeedSearchSchema, indeedJobSchema } from "~/schemas/indeed";
import { sql } from "drizzle-orm";

interface SaveJobSearchParams {
  jobs: IndeedJob[];
  userId: string;
  searchCriteria: {
    role: string;
    location: string;
    country: string;
  };
}

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

export async function GET(request: Request): Promise<Response> {
  const validatedQuery = validateQueryParams(request.url, indeedSearchSchema);

  const input = {
    position: validatedQuery.role,
    country: validatedQuery.country,
    location: validatedQuery.location,
    maxItems: validatedQuery.limit,
    parseCompanyDetails: false,
    saveOnlyUniqueItems: true,
    followApplyRedirects: true,
    maxConcurrency: 5,
  };

  const run = await client.actor("misceres/indeed-scraper").call(input);

  try {
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    const validatedJobs = validateJobs(items, indeedJobSchema);

    if (validatedJobs.length > 0) {
      await saveJobSearchResults({
        jobs: validatedJobs,
        userId: "some-user-id",
        searchCriteria: validatedQuery,
      });

      return new Response("OK", { status: 200 });
    }

    return new Response("No jobs found", { status: 404 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response("Server internal error", { status: 500 });
  }
}

async function saveJobSearchResults({
  jobs,
  userId,
  searchCriteria,
}: SaveJobSearchParams) {
  return await db.transaction(async (tx) => {
    const [jobFilter] = await tx
      .insert(JobFilters)
      .values({
        userId,
        role: searchCriteria.role,
        city: searchCriteria.location,
        country: searchCriteria.country,
      })
      .returning();

    const [savedSearch] = await tx
      .insert(SavedSearches)
      .values({
        userId,
        jobFilterId: jobFilter?.id,
        expiresAt: sql`CURRENT_TIMESTAMP + INTERVAL '3 days'`,
      })
      .returning();

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
      savedSearchId: savedSearch?.id,
      jobId: job.insertedId,
    }));

    await tx.insert(SavedSearchJobs).values(savedSearchJobsToInsert);

    return {
      jobFilterId: jobFilter?.id,
      savedSearchId: savedSearch?.id,
      jobsCount: insertedJobs.length,
    };
  });
}
