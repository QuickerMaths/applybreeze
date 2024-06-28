import { ApifyClient } from 'apify-client';
import { validateJobs } from '~/lib/validateJobs';
import { querySchema, indeedJobSchema } from '~/types/indeed';
import { validateQueryParams } from '~/lib/validateQueryParams';

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

        return Response.json(validatedJobs);
    } catch (error: unknown) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 500 });
        }

        return new Response('Server internal error', { status: 500 });
    }
}
