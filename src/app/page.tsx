import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import BarChartComponent from "~/components/bar-chart/bar-chart";
import { RadialChartComponent } from "~/components/radial-chart/radial-chart";
import { getCurrentUserId } from "~/lib/getCurrentUser";
import { getAnalytics } from "~/server/queries/analytics-queries";
import { getWeeklyGoal } from "~/server/queries/weekly-goal-queries";

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

  await queryClient.prefetchQuery({
    queryKey: ["weeklyGoal", userId],
    queryFn: async () => await getWeeklyGoal(userId),
  });

  return (
    <main className="flex items-center justify-center gap-5 bg-background dark:bg-background">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BarChartComponent userId={userId} />
        <RadialChartComponent userId={userId} />
      </HydrationBoundary>
    </main>
  );
}
