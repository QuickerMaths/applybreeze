import type { z, ZodTypeAny } from "zod";

export function validateQueryParams<T extends ZodTypeAny>(
  url: string | undefined,
  schema: T,
): z.infer<T> {
  if (!url) return null;

  const { searchParams } = new URL(url);

  const params: Record<string, string | null> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const parsedParams = schema.safeParse(params);

  if (!parsedParams.success) return null;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return parsedParams.data;
}
