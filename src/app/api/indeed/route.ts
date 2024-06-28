import { ApifyClient } from 'apify-client';
import { validateJobs } from '~/lib/validateJobs';
import indeedJobSchema from '~/types/indeed';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});


export async function GET(request: Request): Promise<Response> {
    const { searchParams } = new URL(request.url);

    const role = searchParams.get('role') ?? '';
    const location = searchParams.get('location') ?? '';
    const limit = searchParams.get('limit') ?? 5;
    const country = searchParams.get('country') ?? 'US';

    const input = {
        "position": role, 
        "country": country,
        "location": location,
        "maxItems": limit,
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
