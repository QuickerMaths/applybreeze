import type { InferSelectModel } from "drizzle-orm";
import type { SavedSearchJobs, Jobs } from "~/server/db/schema";

export type SavedSearchJobsType = InferSelectModel<typeof SavedSearchJobs> & {
    job: Pick<InferSelectModel<typeof Jobs>, "id" | "title">;
};
