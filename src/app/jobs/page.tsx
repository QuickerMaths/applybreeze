import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import React from "react";
import { getCurrentUserId } from "~/lib/getCurrentUser";
import SavedSearchJobs from "~/components/saved-search-jobs/saved-search-jobs";
import { getPendingRequests } from "~/server/queries/request-queries";
import { getAllJobs } from "~/server/queries/jobs-queries";

export default async function SavedSearch() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60,
      },
    },
  });

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["jobs", userId],
    queryFn: async ({ pageParam }: { pageParam: number }) =>
      await getAllJobs(userId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages) => {
      const lastId = lastPage[lastPage.length - 1]?.id;
      return lastId;
    },
    pages: 1,
  });

  await queryClient.prefetchQuery({
    queryKey: ["requests", userId],
    queryFn: async () => await getPendingRequests(userId),
  });

  return (
    <main className="flex flex-col items-center bg-background dark:bg-background">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SavedSearchJobs userId={userId} />
      </HydrationBoundary>
    </main>
  );
}
