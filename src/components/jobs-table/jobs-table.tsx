"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import useCreateQueryString from "~/hooks/useCreateQueryString";
import { getAllJobs } from "~/server/queries/jobs-queries";
import { Button } from "../ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from "../ui/table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  flexRender,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import type { JobsWithApplicationsType } from "~/types/jobs";
import useJobsColumns from "~/lib/useColumnsJobs";
import Link from "next/link";
import DeleteJob from "../delete-job/delete-job";
import JobsFilters from "../jobs-filters/jobs-filters";

interface JobsTableProps {
  userId: string;
}

export default function JobsTable({ userId }: JobsTableProps) {
  const createQueryString = useCreateQueryString();
  const jobsColumns = useJobsColumns();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const {
    data: jobs,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["jobs", userId],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      // change this to a query that would allowe filtering and ordering data
      getAllJobs(userId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages) => {
      if (lastPage.length < 10) return undefined;
      const lastId = lastPage[lastPage.length - 1]?.id;
      return lastId;
    },
  });

  const table = useReactTable<JobsWithApplicationsType>({
    data: jobs?.pages.flatMap((page) => page) ?? [],
    columns: jobsColumns,
    state: {
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    manualPagination: true,
  });

  return (
    <div>
      <h2 className="mb-2 text-center text-2xl font-bold text-primary dark:text-primary">
        Saved Jobs
      </h2>
      <JobsFilters table={table} />
      <Table className="block h-[700px] w-full overflow-y-scroll">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((column) => (
                <TableHead className="dark:text-white" key={column.id}>
                  {column.column.columnDef.header as string}
                </TableHead>
              ))}
              <TableHead className="dark:text-white">Details</TableHead>
              <TableHead className="dark:text-white">Delete</TableHead>
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
              <TableCell>
                <Link
                  href={`/job-details?${createQueryString({ jobId: row.original.id, userId })}`}
                >
                  <Button>Details</Button>
                </Link>
              </TableCell>
              <TableCell>
                <DeleteJob jobId={row.original.id} userId={userId} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={11}>
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
    </div>
  );
}
