import { ApifyClient } from "apify-client";
import { validateJobs } from "~/lib/validateJobs";
import { validateQueryParams } from "~/lib/validateQueryParams";
import { indeedSearchSchema, indeedJobSchema } from "~/schemas/indeed";
import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest } from "next";
import { saveJobSearchResults } from "~/server/queries/jobs-queries";

const client = new ApifyClient({
  token: process.env.APIFY_TOKEN,
});

export async function POST(request: NextApiRequest): Promise<Response> {
  const { userId } = getAuth(request);

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

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
        userId,
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
