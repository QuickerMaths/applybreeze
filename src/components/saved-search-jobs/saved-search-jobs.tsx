"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getPendingRequests } from "~/server/queries/request-queries";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "../ui/button";
import RequestLoader from "../request-loader/request-loader";
import Link from "next/link";
import useCreateQueryString from "~/hooks/useCreateQueryString";
import { getAllJobs } from "~/server/queries/jobs-queries";

interface SavedSearchJobsProps {
  userId: string;
}

export default function SavedSearchJobs({ userId }: SavedSearchJobsProps) {
  const createQueryString = useCreateQueryString();
  const {
    data: jobs,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["jobs", userId],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getAllJobs(userId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages) => {
      if (lastPage.length < 10) return undefined;
      const lastId = lastPage[lastPage.length - 1]?.id;
      return lastId;
    },
  });

  const { data: pendingRequestsData } = useQuery({
    queryKey: ["requests", userId],
    queryFn: async () => await getPendingRequests(userId),
  });

  // TODO: create proper naviagtion to the jobs-details (only jobs that fit current filters and sorting should be displayed)

  return (
    <div className="mx-auto flex flex-col items-center justify-center">
      {pendingRequestsData && pendingRequestsData.length > 0 && (
        <>
          <h2 className="mb-2 text-2xl font-bold text-primary dark:text-primary">
            Pending requests
          </h2>
          <ul className="mb-2 flex w-full flex-col gap-y-2">
            {pendingRequestsData.map((request) => (
              <RequestLoader
                key={request.id}
                userId={userId}
                request={request}
                isInSavedSearchJobs
              />
            ))}
          </ul>
        </>
      )}
      {jobs?.pages ? (
        <>
          <Table className="block h-[700px] w-full overflow-y-scroll">
            <TableHeader>
              <TableRow>
                <TableHead className="dark:text-white">Role</TableHead>
                <TableHead className="dark:text-white">City</TableHead>
                <TableHead className="dark:text-white">Country</TableHead>
                <TableHead className="dark:text-white">Salary</TableHead>
                <TableHead className="dark:text-white">Seniority</TableHead>
                <TableHead className="dark:text-white">Url</TableHead>
                <TableHead className="dark:text-white"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.pages.map((page) =>
                page.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="w-[10%]">{job.title}</TableCell>
                    <TableCell>{job.city}</TableCell>
                    <TableCell>{job.country}</TableCell>
                    <TableCell>{job.salary ?? "N/A"}</TableCell>
                    <TableCell>{job.seniorityLevel}</TableCell>
                    <TableCell className="max-w-[100px] truncate">
                      <a href={job.url ?? job.sourceUrl!} target="_blank">
                        {job.url ?? job.sourceUrl}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/job-details?${createQueryString({ jobId: job.id, userId })}`}
                      >
                        <Button>Details</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )),
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={10}>
                  {hasNextPage ? (
                    <Button
                      onClick={() => fetchNextPage()}
                      className="mx-auto mt-2 block w-1/2"
                      disabled={isFetchingNextPage || isFetching}
                    >
                      {isFetchingNextPage ? "Loading more..." : "Load more"}
                    </Button>
                  ) : (
                    <p className="mt-2 text-center">No more results</p>
                  )}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </>
      ) : (
        <p>No jobs found</p>
      )}
    </div>
  );
}
