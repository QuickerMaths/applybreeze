import { ApifyClient } from 'apify-client';
import { validateJobs } from '~/lib/validateJobs';
import { querySchema, indeedJobSchema } from '~/types/indeed';
import type { IndeedJob } from '~/types/indeed';
import { db } from '~/server/db';
import { validateQueryParams } from '~/lib/validateQueryParams';
import { Companies, JobLocations, Jobs, JobSeniorityLevels, JobSources, JobTitles } from '~/server/db/schema';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

export async function GET(request: Request): Promise<Response> {
    const validatedQuery = validateQueryParams(request.url, querySchema);

    const input = {
        "position": validatedQuery.role, 
        "country": validatedQuery.country,
        "location": validatedQuery.location,
        "maxItems": validatedQuery.limit,
        "parseCompanyDetails": false,
        "saveOnlyUniqueItems": true,
        "followApplyRedirects": true,
        "maxConcurrency": 5
    };

    const run = await client.actor("misceres/indeed-scraper").call(input);

    try {
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        const validatedJobs = validateJobs(items, indeedJobSchema);

        if(validatedJobs.length > 0){
            await saveJobsToDB(validatedJobs);
            
            return new Response('OK', { status: 200 });
        }

        return new Response('No jobs found', { status: 404 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 500 });
        }

        return new Response('Server internal error', { status: 500 });
    }
}

async function saveJobsToDB(jobs: IndeedJob[]) {
    await Promise.all([
        jobs.map(async (job) => {
            await db.insert(Jobs).values({
                title: job.positionName,
                city: job.location,
                source: 'indeed',
                companyName: job.company,
                description: job.description,
                url: job.externalApplyLink ?? job.url,
                salary: job.salary,
                country: job.searchInput.country,
                seniorityLevel: 'unknown',
                sourceUrl: job.url,
            }).onConflictDoNothing();
        })
    ]);
}
