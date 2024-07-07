import type { z } from "zod";
import type { indeedJobSchema } from "~/schemas/indeed";

export type IndeedJob = z.infer<typeof indeedJobSchema>;

export interface SaveJobSearchParams {
  jobs: IndeedJob[];
  userId: string;
  savedSearchId: number;
}

export interface SearchJobsParams {
  role: string;
  location: string;
  country: string;
}
