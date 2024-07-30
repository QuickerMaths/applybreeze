import type { InferSelectModel } from "drizzle-orm";
import type { Applications, Jobs } from "~/server/db/schema";

export type JobsWithApplicationsType = InferSelectModel<typeof Jobs> & {
  applications: InferSelectModel<typeof Applications>;
};
