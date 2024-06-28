import { ApifyClient } from 'apify-client';
import { validateJobs } from '~/lib/validateJobs';
import { querySchema, indeedJobSchema } from '~/types/indeed';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});


export async function GET(request: Request): Promise<Response> {
    const { searchParams } = new URL(request.url);

    const role = searchParams.get('role');
    const location = searchParams.get('location');
    const limit = searchParams.get('limit');
    const country = searchParams.get('country');

    const validatedQuery = querySchema.safeParse({ role, location, limit, country });

    const input = {
        "position": validatedQuery.data?.role, 
        "country": validatedQuery.data?.country,
        "location": validatedQuery.data?.location,
        "maxItems": validatedQuery.data?.limit,
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
