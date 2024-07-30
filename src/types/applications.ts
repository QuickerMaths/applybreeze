import type { InferSelectModel } from "drizzle-orm";
import { z } from "zod";
import { applicationStatuses } from "~/constants/applications";
import type { Applications } from "~/server/db/schema";

const applicationStatus = z.enum(applicationStatuses);

export type ApplicationStatusType = z.infer<typeof applicationStatus>;

export type ApplicationsType = InferSelectModel<typeof Applications>;
