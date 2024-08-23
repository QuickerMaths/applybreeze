"use client";

import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { getAnalytics } from "~/server/queries/analytics-queries";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "~/lib/utils";

const chartConfig = {
  searches: {
    label: "Searched Jobs",
    color: "hsl(var(--chart-1))",
  },
  applications: {
    label: "Applied Jobs",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface BarChartComponentProps {
  userId: string;
}

export default function BarChartComponent({ userId }: BarChartComponentProps) {
  const { data: analytics } = useQuery({
    queryKey: ["analytics", userId],
    queryFn: async () => await getAnalytics(userId, 3),
  });

  const chartData = analytics?.map(
    ({ month, year, savedApplications, appliedApplications }) => {
      const date = new Date(year, month);
      return {
        date: date.toLocaleString("en-us", { month: "long", year: "numeric" }),
        searches: savedApplications,
        applications: appliedApplications,
      };
    },
  );

  return (
    <Card className="w-[30%]">
      <CardHeader className="text-center">
        <CardTitle>Applications Analytics</CardTitle>
        {chartData && chartData.length > 0 && (
          <CardDescription>
            {chartData[0]?.date}-{chartData[chartData?.length - 1]?.date}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent
        className={cn(
          ((chartData && chartData.length < 1) ?? !chartData) &&
            "flex flex-col items-center justify-center gap-y-5",
        )}
      >
        {chartData && chartData.length > 0 ? (
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="searches" fill="var(--color-searches)" radius={4} />
              <Bar
                dataKey="applications"
                fill="var(--color-applications)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <>
            <h2>You don&apos;t have any applications or searches yet</h2>
            <Button variant="outline">
              <Link href="/find-jobs">Search for a jobs</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
