import { z } from 'zod';

const indeedJobSchema = z.object({
  positionName: z.string(),
  salary: z.string(),
  jobType: z.array(z.string()),
  company: z.string(),
  location: z.string(),
  rating: z.number().min(0).max(5),
  reviewsCount: z.number().nonnegative(),
  urlInput: z.string().nullable(),
  url: z.string().url(),
  id: z.string(),
  postedAt: z.string(),
  scrapedAt: z.string().datetime(),
  postingDateParsed: z.string().datetime(),
  description: z.string(),
  descriptionHTML: z.string(),
  externalApplyLink: z.string().url(),
  searchInput: z.object({
    position: z.string(),
    location: z.string(),
    country: z.string().length(2),
  }),
  isExpired: z.boolean(),
});


export type IndeedJobType = z.infer<typeof indeedJobSchema>;

export default indeedJobSchema;
