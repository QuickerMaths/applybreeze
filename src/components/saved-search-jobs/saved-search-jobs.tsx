"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getSavedSearchJobs } from "~/server/queries/jobs-queries";
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

interface SavedSearchJobsProps {
  userId: string;
  savedSearchId: number;
}

export default function SavedSearchJobs({
  userId,
  savedSearchId,
}: SavedSearchJobsProps) {
  const { data, hasNextPage, isFetchingNextPage, isFetching, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["savedSearchJobs", userId],
      queryFn: ({ pageParam }: { pageParam: number }) =>
        getSavedSearchJobs(savedSearchId, pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage, _pages) => {
        if (lastPage.length < 10) return undefined;
        const lastId = lastPage[lastPage.length - 1]?.id;
        return lastId;
      },
    });

  return (
    <div className="mx-auto flex w-3/4 flex-col items-center justify-center">
      {data?.pages ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="dark:text-white">Role</TableHead>
                <TableHead className="dark:text-white">City</TableHead>
                <TableHead className="dark:text-white">Country</TableHead>
                <TableHead className="dark:text-white">Salary</TableHead>
                <TableHead className="dark:text-white">Seniority</TableHead>
                <TableHead className="dark:text-white">Url</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.pages.map((page) =>
                page.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="w-[10%]">{job.job.title}</TableCell>
                    <TableCell>{job.job.city}</TableCell>
                    <TableCell>{job.job.country}</TableCell>
                    <TableCell>{job.job.salary ?? "N/A"}</TableCell>
                    <TableCell>{job.job.seniorityLevel}</TableCell>
                    <TableCell className="max-w-[100px] truncate">
                      <a
                        href={job.job.url ?? job.job.sourceUrl!}
                        target="_blank"
                      >
                        {job.job.url ?? job.job.sourceUrl}
                      </a>
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
