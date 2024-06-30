import type { z } from "zod";
import type { indeedJobSchema } from "~/schemas/indeed";

export type IndeedJob = z.infer<typeof indeedJobSchema>;
