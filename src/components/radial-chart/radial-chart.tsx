"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "~/components/ui/chart";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    changeWeeklyGoal,
    getWeeklyGoal,
} from "~/server/queries/weekly-goal-queries";
import { Button } from "../ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover";
import { Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "~/components/ui/input";
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage,
} from "../ui/form";
import type { WeeklyGoal } from "~/server/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { useState } from "react";

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
    const [closePopover, setClosePopover] = useState<boolean>(false);
    const queryClient = useQueryClient();
    const form = useForm({
        defaultValues: {
            weeklyGoal: 10,
        },
    });
    const { data: weeklyGoal } = useQuery({
        queryKey: ["weeklyGoal", userId],
        queryFn: () => getWeeklyGoal(userId),
    });

    const chartData = [
        {
            month: new Date().getMonth(),
            progress: weeklyGoal?.progress,
            goal:
                weeklyGoal?.goal - weeklyGoal?.progress > 0
                    ? weeklyGoal?.goal - weeklyGoal?.progress
                    : 0,
        },
    ];

    const mutation = useMutation({
        mutationFn: async (newGoal: number) =>
            await changeWeeklyGoal(userId, newGoal),
        onMutate: async (newGoal: number) => {
            await queryClient.invalidateQueries({
                queryKey: ["weeklyGoal", userId],
            });

            queryClient.setQueryData(
                ["weeklyGoal", userId],
                (old: InferSelectModel<typeof WeeklyGoal>) => {
                    return {
                        ...old,
                        weeklyGoal: newGoal,
                    };
                },
            );
            setClosePopover(!closePopover);
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["weeklyGoal", userId],
            });
        },
    });

    async function onSubmit(values: { weeklyGoal: number }) {
        const { weeklyGoal: newGoal } = values;
        mutation.mutate(newGoal);
    }

    return (
        <Card className="flex w-[25%] flex-col">
            <CardHeader className="relative items-center pb-5">
                <CardTitle>Weekly goal</CardTitle>
                <Popover open={closePopover} onOpenChange={setClosePopover}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className="absolute right-[5px] top-0">
                            <Settings />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="flex w-full flex-col items-center justify-center gap-y-5 px-5 py-3">
                        <h2 className="text-lg font-semibold">Change your weekly goal</h2>
                        <Form {...form}>
                            <form
                                className="flex w-full flex-col items-center justify-center gap-y-3"
                                onSubmit={form.handleSubmit(onSubmit)}
                            >
                                <FormField
                                    control={form.control}
                                    name="weeklyGoal"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Weekly Goal..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button className="w-full" type="submit" variant="outline">
                                    Change goal
                                </Button>
                            </form>
                        </Form>
                    </PopoverContent>
                </Popover>
            </CardHeader>
            <CardContent className="flex flex-1 items-center pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square w-full max-w-[200px]"
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
