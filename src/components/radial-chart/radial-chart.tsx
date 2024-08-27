"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { getWeeklyGoal } from "~/server/queries/weekly-goal-queries";

const chartConfig = {
  progress: {
    label: "Progress",
    color: "hsl(var(--chart-1))",
  },
  goal: {
    label: "Goal",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface RadialChartComponentProps {
  userId: string;
}

export function RadialChartComponent({ userId }: RadialChartComponentProps) {
  const { data: weeklyGoal } = useQuery({
    queryKey: ["weeklyGoal", userId],
    queryFn: () => getWeeklyGoal(userId),
  });

  const chartData = [
    {
      month: new Date().getMonth(),
      progress: weeklyGoal?.progress,
      goal: (weeklyGoal?.goal ?? 10) - (weeklyGoal?.progress ?? 0),
    },
  ];

  return (
    <Card className="flex w-[20%] flex-col">
      <CardHeader className="items-center pb-5">
        <CardTitle>Weekly goal</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        className="pt-10"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {weeklyGoal?.progress}/{weeklyGoal?.goal}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Achive you weekly goal
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="goal"
              fill="var(--color-goal)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="progress"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-progress)"
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
