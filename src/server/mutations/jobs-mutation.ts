import type { z, ZodType } from "zod";
import axios from "axios";

export async function getJobs<T extends ZodType>(
  values: z.infer<T>,
  endpoint: string,
) {
  const stringValues = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, String(value)]),
  );
  const params = new URLSearchParams(stringValues).toString();

  return await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}?${params}`,
  );
}
