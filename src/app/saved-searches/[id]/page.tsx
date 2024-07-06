import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import React from "react";
import { getCurrentUserId } from "~/lib/getCurrentUser";
import {
  getSavedSearchFilters,
  getSavedSearchJobs,
} from "~/server/queries/jobs-queries";
import SavedSearchJobs from "~/components/saved-search-jobs/saved-search-jobs";

interface SavedSearchProps {
  params: {
    id: number;
  };
}

export default async function SavedSearch({ params }: SavedSearchProps) {
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
    queryKey: ["savedSearchJobs", userId],
    queryFn: async ({ pageParam }: { pageParam: number }) =>
      await getSavedSearchJobs(params.id, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages) => {
      const lastId = lastPage[lastPage.length - 1]?.id;
      return lastId;
    },
    pages: 1,
  });

  const savedSearchFiltes = await getSavedSearchFilters(params.id);

  return (
    <main className="my-10 flex min-h-screen flex-col items-center bg-background dark:bg-background">
      <div className="mb-5 flex flex-col items-center justify-center">
        <h2>Applied Job Filters</h2>
        <div className="flex items-center justify-center gap-3">
          <p className="text-2xl font-bold text-primary dark:text-primary">
            <span className="text-gray-500">Role:</span>{" "}
            {savedSearchFiltes?.jobFilter?.role ?? "N/A"}
          </p>
          <p className="text-2xl font-semibold text-primary dark:text-primary">
            <span className="text-gray-500">Location:</span>{" "}
            {savedSearchFiltes?.jobFilter?.city ?? "N/A"},{" "}
            {savedSearchFiltes?.jobFilter?.country ?? "N/A"}
          </p>
        </div>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SavedSearchJobs userId={userId} savedSearchId={params.id} />
      </HydrationBoundary>
    </main>
  );
}
