import { z } from "zod";

const indeedJobSchema = z.object({
  positionName: z.string(),
  salary: z.string().nullable(),
  jobType: z.array(z.string().nullable()).nullable(),
  company: z.string(),
  location: z.string(),
  rating: z.number().min(0).max(5).nullable(),
  reviewsCount: z.number().nonnegative().nullable(),
  urlInput: z.string().nullable(),
  url: z.string().url(),
  id: z.string(),
  postedAt: z.string(),
  scrapedAt: z.string().datetime(),
  postingDateParsed: z.string().datetime(),
  description: z.string().nullable(),
  descriptionHTML: z.string().nullable(),
  externalApplyLink: z.string().url().nullable(),
  searchInput: z.object({
    position: z.string(),
    location: z.string(),
    country: z.string(),
  }),
  isExpired: z.boolean(),
});

const indeedSearchSchema = z.object({
  role: z.string().optional().default(""),
  location: z.string().optional().default(""),
  limit: z.preprocess(
    (value) => Number(value),
    z.number().int().max(50).positive().optional().default(5),
  ),
  country: z.string().length(2).optional().default("US"),
});

export { indeedJobSchema, indeedSearchSchema };
