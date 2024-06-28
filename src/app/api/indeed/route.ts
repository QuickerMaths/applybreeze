import { ApifyClient } from 'apify-client';
import { validateJobs } from '~/lib/validateJobs';
import { querySchema, indeedJobSchema, IndeedJob } from '~/types/indeed';
import { db } from '~/server/db';
import { validateQueryParams } from '~/lib/validateQueryParams';
import { JobLocations, Jobs, JobSeniorityLevels, JobSources, JobTitles } from '~/server/db/schema';

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
            console.log(validatedJobs);
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
            const title = await db.insert(JobTitles).values({ title: job.positionName }).returning({ insertedId: JobTitles.id }).onConflictDoNothing();
            const location = await db.insert(JobLocations).values({ city: job.location, state: '', country: '' }).returning({ insertedId: JobLocations.id }).onConflictDoNothing();
            const source = await db.insert(JobSources).values({ name: 'indeed', url: job.url }).returning({ insertedId: JobSources.id }).onConflictDoNothing();
            const seniority = await db.insert(JobSeniorityLevels).values({ level: 'entry' }).returning({ insertedId: JobSeniorityLevels.id }).onConflictDoNothing();

            await db.insert(Jobs).values({
                titleId: title[0]?.insertedId,
                locationId: location[0]?.insertedId,
                sourceId: source[0]?.insertedId,
                seniorityLevelId: seniority[0]?.insertedId,
                company: job.company,
                description: job.description,
                url: job.url,
            }).onConflictDoNothing();
        })
    ]);
}
