import { ApifyClient } from 'apify-client';


const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

export async function GET(request: Request): Promise<Response> {
    const { searchParams } = new URL(request.url);

    const role = searchParams.get('role') ?? '';
    const location = searchParams.get('location') ?? '';

    const input = {
        "position": role, 
        "country": "US",
        "location": location,
        "maxItems": 5,
        "parseCompanyDetails": false,
        "saveOnlyUniqueItems": true,
        "followApplyRedirects": true,
        "maxConcurrency": 5
    };

    const run = await client.actor("misceres/indeed-scraper").call(input);

    try {
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        return Response.json(items);
    } catch (error) {
        return new Response(error.message, { status: 500 });
    }

}
