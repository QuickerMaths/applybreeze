import React from "react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import {
  getJob,
  getSavedSearchJobsTitles,
} from "~/server/queries/jobs-queries";
import JobTitles from "~/components/job-titles/job-titles";

interface JobDetailsLayoutProps {
  params: {
    id: number;
    jobId: number;
    userId: string;
  };
  children: React.ReactNode;
}

export default async function JobDetailsLayout({
  params: { id: savedSearchId, jobId, userId },
  children,
}: JobDetailsLayoutProps) {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["jobTitles", userId],
    queryFn: async ({ pageParam }: { pageParam: number }) =>
      await getSavedSearchJobsTitles(savedSearchId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages) => {
      const lastId = lastPage[lastPage.length - 1]?.id;
      return lastId;
    },
    pages: 1,
  });

  await queryClient.prefetchQuery({
    queryKey: ["job", jobId, userId],
    queryFn: async () => await getJob(jobId),
  });

  return (
    <main className="flex items-center justify-center bg-background dark:bg-background">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <JobTitles savedSearchId={savedSearchId} userId={userId} />
        {children}
      </HydrationBoundary>
    </main>
  );
}
