import React from "react";
import { Button } from "../ui/button";
import { EyeOpenIcon, CheckIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { JobSearchRequest } from "~/server/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { completeRequest } from "~/server/queries/request-queries";
import { cn } from "~/lib/utils";

interface RequestLoaderProps {
    userId: string;
    request: InferSelectModel<typeof JobSearchRequest> & {
        savedSearch: {
            role: string | null;
            country: string | null;
            city: string | null;
        };
    };
    isInSavedSearchJobs?: boolean;
}

export default function RequestLoader({
    userId,
    request,
    isInSavedSearchJobs,
}: RequestLoaderProps) {
    const queryClient = useQueryClient();

    const completeMutation = useMutation({
        mutationFn: () => completeRequest(request.id),
        onSettled: async () =>
            await queryClient.invalidateQueries({ queryKey: ["requests", userId] }),
    });

    return (
        <li
            className={cn(
                "flex w-full items-center justify-between rounded-md border border-gray-200 bg-white px-5 py-2 text-white shadow-sm",
                request.status === "completed" && "bg-green-400",
                request.status === "failed" && "bg-red-400",
                request.status === "pending" && "bg-white",
            )}
        >
            <p
                className={cn(
                    "text-center",
                    request.status === "pending" && "text-black",
                )}
            >
                {request.status === "pending"
                    ? "Processing request..."
                    : request.status === "completed"
                        ? "Request completed"
                        : "Request failed"}
            </p>
            <div
                className={cn(
                    "flex flex-col items-start justify-center text-center",
                    request.status === "pending" && "text-black",
                )}
            >
                <p>
                    <span>Role:</span> {request.savedSearch.role ?? "N/A"}
                </p>
                <p>
                    <span>Location:</span> {request.savedSearch.city ?? "N/A"},{" "}
                    {request.savedSearch.country ?? "N/A"}
                </p>
            </div>
            {!isInSavedSearchJobs && (
                <div className="flex items-center justify-center gap-2">
                    <Link href={`/jobs/${request.savedSearchId}`}>
                        <Button className="flex w-full items-center justify-center gap-x-2 bg-blue-500 text-white hover:bg-blue-700">
                            View Search
                            <EyeOpenIcon className="h-5 w-5" />
                        </Button>
                    </Link>
                    {request.status !== "pending" && (
                        <Button
                            onClick={() => completeMutation.mutate()}
                            className="flex w-full items-center justify-center gap-x-2 bg-green-600 text-white hover:bg-green-700"
                        >
                            {completeMutation.isPending ? "Completing..." : "Complete"}
                            <CheckIcon className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            )}
        </li>
    );
}
