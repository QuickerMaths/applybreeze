import { z } from "zod";
import { applicationStatuses } from "~/constants/applications";

const applicationStatus = z.enum(applicationStatuses);

export type ApplicationStatusType = z.infer<typeof applicationStatus>;
