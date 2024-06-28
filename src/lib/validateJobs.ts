import type { indeedJobSchema } from '../types/indeed';

export function validateJobs(jobs: Record<string | number, unknown>[], schema: typeof indeedJobSchema): Record<string | number, unknown>[] {
    return jobs.filter(job => {
        const result = schema.safeParse(job);

        if(result.success) {
            return job;
        }
    });
}
