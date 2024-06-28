import type { z, ZodTypeAny } from 'zod';

export function validateJobs<T extends ZodTypeAny>(data: unknown[], schema: T): z.infer<T>[] {
    return data.map((job) => {
        const result = schema.safeParse(job);

        if(!result.success) {
            console.error(result.error);
            return;
        }

        return job;
    });
}
