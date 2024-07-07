"use client";

import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getSearchResults } from "~/server/queries/jobs-queries";
import SearchResult from "../search-result/search-result";
import { Button } from "../ui/button";

interface SearchResultsProps {
  userId: string;
}

export default function SearchResults({ userId }: SearchResultsProps) {
  const { data, hasNextPage, isFetchingNextPage, isFetching, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["searchResults", userId],
      queryFn: ({ pageParam }: { pageParam: number }) =>
        getSearchResults(userId, pageParam),
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
          <ul className="flex w-full flex-col items-center justify-center gap-y-2">
            {data.pages.map((page) =>
              page.map((searchResult) => (
                <SearchResult
                  key={searchResult.id}
                  role={searchResult.role}
                  city={searchResult.city}
                  country={searchResult.country}
                  jobSearchId={searchResult.id}
                  userId={userId}
                />
              )),
            )}
          </ul>
          {hasNextPage ? (
            <Button
              onClick={() => fetchNextPage()}
              className="mt-2 w-1/2"
              disabled={isFetchingNextPage || isFetching}
            >
              {isFetchingNextPage ? "Loading more..." : "Load more"}
            </Button>
          ) : (
            <p className="mt-2 text-center">No more results</p>
          )}
        </>
      ) : (
        <p>No search results found</p>
      )}
    </div>
  );
}
