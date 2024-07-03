"use client";

import React from "react";
import { TypographyH1 } from "~/components/typography/typography";
import { useQuery } from "@tanstack/react-query";
import { getSearchResults } from "~/server/queries/jobs-queries";
import SearchResult from "../search-result/search-result";

interface SearchResultsProps {
  userId: string;
  initialData: Awaited<ReturnType<typeof getSearchResults>>;
}

export default function SearchResults({
  userId,
  initialData,
}: SearchResultsProps) {
  const { data } = useQuery({
    queryKey: ["searchResults", userId],
    queryFn: () => getSearchResults(userId),
    initialData: initialData,
  });

  return (
    <div className="mx-auto w-1/2">
      <TypographyH1 tag="h3" className="mb-5 text-center text-4xl font-bold">
        Search Results
      </TypographyH1>
      {data.length ? (
        <ul className="flex flex-col items-center justify-center gap-y-3">
          {data.map(({ id, jobFilter }) => (
            <SearchResult
              key={id}
              jobFilter={jobFilter}
              jobSearchId={id}
              userId={userId}
            />
          ))}
        </ul>
      ) : (
        <p>No search results found</p>
      )}
    </div>
  );
}
