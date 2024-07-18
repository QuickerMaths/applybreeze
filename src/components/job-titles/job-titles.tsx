"use client";

import React from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "~/components/ui/table";
import { getSavedSearchJobs } from "~/server/queries/jobs-queries";
import { useRouter, usePathname } from "next/navigation";
import useCreateQueryString from "~/hooks/useCreateQueryString";

interface JobDetailsLayoutProps {
  savedSearchId: number;
  userId: string;
}

export default function JobTitles({
  savedSearchId,
  userId,
}: JobDetailsLayoutProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const createQueryString = useCreateQueryString();
  const {
    data: savedSearchJobsData,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["jobTitles", userId],
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
    <div>
      {savedSearchJobsData?.pages && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="dark:text-white">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="block h-[700px] w-full overflow-y-scroll">
            {savedSearchJobsData.pages.map((page) =>
              page.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Button
                      variant="link"
                      className="text-left"
                      onClick={async () => {
                        router.push(
                          pathname + "?" + createQueryString({ jobId: job.id }),
                        );
                        await queryClient.invalidateQueries({
                          queryKey: ["job", job.id, userId],
                        });
                      }}
                    >
                      {job.job.title}
                    </Button>
                  </TableCell>
                </TableRow>
              )),
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>
                {hasNextPage ? (
                  <Button
                    onClick={() => fetchNextPage()}
                    className="mx-auto block w-1/2"
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
      )}
    </div>
  );
}
