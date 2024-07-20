import { applicationStatusEnum } from "~/server/db/schema";
import { z } from "zod";

const applicationStatus = z.enum(applicationStatusEnum.enumValues);

export type ApplicationStatusType = z.infer<typeof applicationStatus>;
