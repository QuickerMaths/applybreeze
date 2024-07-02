"use client";

import React from "react";
import { TypographyH1 } from "~/components/typography/typography";
import { useQuery } from "@tanstack/react-query";
import { getSearchResults } from "~/server/queries/jobs-queries";

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
      <TypographyH1 tag="h3" className="text-center text-4xl font-bold">
        Search Results
      </TypographyH1>
      {data.length ? (
        <ul>
          {data.map((search) => (
            <li key={search.id}>
              <h4>{search.jobFilter?.role}</h4>
              <p>{search.jobFilter?.city}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No search results found</p>
      )}
    </div>
  );
}
