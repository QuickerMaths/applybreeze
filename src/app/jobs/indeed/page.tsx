import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import IndeedForm from "~/components/indeed-form/indeed-form";
import RequestsQueue from "~/components/requests-queue/requests-queue";
import { getCurrentUserId } from "~/lib/getCurrentUser";
import { getRequests } from "~/server/queries/jobs-queries";

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

  await queryClient.prefetchQuery({
    queryKey: ["requests", userId],
    queryFn: async () => await getRequests(userId),
  });

  return (
    <main className="my-10 flex min-h-screen flex-col items-center bg-background dark:bg-background">
      <IndeedForm userId={userId} />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <RequestsQueue userId={userId} />
      </HydrationBoundary>
    </main>
  );
}
