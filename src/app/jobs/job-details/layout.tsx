import React from "react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getSavedSearchJobsTitles } from "~/server/queries/jobs-queries";
import JobTitles from "~/components/job-titles/job-titles";
import { getCurrentUserId } from "~/lib/getCurrentUser";

interface JobDetailsLayoutProps {
  children: React.ReactNode;
}

export default async function JobDetailsLayout({
  children,
}: JobDetailsLayoutProps) {
  const queryClient = new QueryClient();
  const userId = await getCurrentUserId();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["jobTitles", userId],
    queryFn: async ({ pageParam }: { pageParam: number }) =>
      await getSavedSearchJobsTitles(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages) => {
      const lastId = lastPage[lastPage.length - 1]?.id;
      return lastId;
    },
    pages: 1,
  });

  return (
    <main className="flex items-center justify-center bg-background dark:bg-background">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <JobTitles userId={userId!} />
      </HydrationBoundary>
      {children}
    </main>
  );
}
