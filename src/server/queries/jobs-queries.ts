"use server";

import { db } from "~/server/db";

export async function getSearchResults(userId: string) {
  return await db.query.SavedSearches.findMany({
    where: (savedSearch, { eq }) => eq(savedSearch.userId, userId),
    with: {
      jobFilter: true,
    },
  });
}
