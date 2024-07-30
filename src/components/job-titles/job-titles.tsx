"use client";

import React, { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
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
import { getSavedSearchJobsTitles } from "~/server/queries/jobs-queries";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import useColumnsTitles from "~/lib/useColumnsTitles";
import { cn } from "~/lib/utils";

interface JobDetailsLayoutProps {
  userId: string;
}

export default function JobTitles({ userId }: JobDetailsLayoutProps) {
  const titlesColumns = useColumnsTitles(userId);
  const [sorting, setSorting] = useState<SortingState>([]);
  const {
    data: savedSearchJobsData,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["jobTitles", userId],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getSavedSearchJobsTitles(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages) => {
      if (lastPage.length < 10) return undefined;
      const lastId = lastPage[lastPage.length - 1]?.id;
      return lastId;
    },
  });

  const flatData = useMemo(
    () => savedSearchJobsData?.pages?.flatMap((page) => page) ?? [],
    [savedSearchJobsData],
  );

  const table = useReactTable({
    data: flatData,
    columns: titlesColumns,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    manualPagination: true,
  });

  return (
    <div>
      {savedSearchJobsData?.pages && (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headersGroup) => (
              <TableRow key={headersGroup.id}>
                {headersGroup.headers.map((column) => (
                  <TableHead
                    className={cn(
                      column.column.getCanSort() &&
                        "cursor-pointer select-none",
                      "dark:text-white",
                    )}
                    onClick={column.column.getToggleSortingHandler()}
                    title={
                      column.column.getCanSort()
                        ? column.column.getNextSortingOrder() === "asc"
                          ? "Sort ascending"
                          : column.column.getNextSortingOrder() === "desc"
                            ? "Sort descending"
                            : "Clear sort"
                        : undefined
                    }
                    key={column.id}
                  >
                    {flexRender(
                      column.column.columnDef.header,
                      column.getContext(),
                    )}
                    {{
                      asc: " 🔼",
                      desc: " 🔽",
                    }[column.column.getIsSorted() as string] ?? null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="block h-[700px] w-full overflow-y-scroll">
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
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
