import React from "react";
import { getSearchResults } from "~/server/queries/jobs-queries";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import SearchResults from "~/components/search-results/search-results";
import { getCurrentUserId } from "~/lib/getCurrentUser";

export default async function SavedSearches() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["searchResults", userId],
    queryFn: async ({ pageParam }: { pageParam: number }) =>
      await getSearchResults(userId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages) => {
      const lastId = lastPage[lastPage.length - 1]?.id;
      return lastId;
    },
    pages: 1,
  });

  return (
    <main className="flex flex-col items-center bg-background dark:bg-background">
      <h1>Saved Searches</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SearchResults userId={userId} />
      </HydrationBoundary>
    </main>
  );
}
