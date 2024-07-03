import React from "react";
import IndeedForm from "~/components/indeed-form/indeed-form";
import { getSearchResults } from "~/server/queries/jobs-queries";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import SearchResults from "~/components/search-results/search-results";
import { getCurrentUserId } from "~/lib/getCurrentUser";

export default async function Indeed() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const queryClient = new QueryClient();

  const initialData = await getSearchResults(userId);

  await queryClient.prefetchQuery({
    queryKey: ["searchResults", userId],
    queryFn: () => Promise.resolve(initialData),
  });

  return (
    <main className="my-10 flex min-h-screen flex-col items-center bg-background dark:bg-background">
      <IndeedForm userId={userId} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SearchResults userId={userId} initialData={initialData.reverse()} />
      </HydrationBoundary>
    </main>
  );
}
