import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import BarChartComponent from "~/components/bar-chart/bar-chart";
import { getCurrentUserId } from "~/lib/getCurrentUser";
import { getAnalytics } from "~/server/queries/analytics-queries";

export default async function HomePage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60,
      },
    },
  });

  await queryClient.prefetchQuery({
    queryKey: ["analytics", userId],
    queryFn: async () => await getAnalytics(userId, 3),
  });

  return (
    <main className="flex items-center justify-center gap-5 bg-background dark:bg-background">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BarChartComponent userId={userId} />
      </HydrationBoundary>
    </main>
  );
}
