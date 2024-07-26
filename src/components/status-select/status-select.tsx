"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { ApplicationStatusType } from "~/types/applications";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  getApplicationStatus,
  updateApplicationStatus,
} from "~/server/queries/application-queries";

interface StatusDropdownProps {
  jobId: number;
}

export default function StatusSelect({ jobId }: StatusDropdownProps) {
  const queryClient = useQueryClient();
  const statuses: ApplicationStatusType[] = [
    "saved",
    "applied",
    "interviewing",
    "rejected",
    "accepted",
  ];

  const {
    data: application,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["applicationStatus", jobId],
    queryFn: async () => await getApplicationStatus(jobId),
  });

  const mutation = useMutation({
    mutationFn: async (status: ApplicationStatusType) => {
      return await updateApplicationStatus(jobId, status);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["applicationStatus", jobId],
      });
    },
  });

  if (isLoading || isRefetching) {
    return <p>Loading...</p>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            application?.status === "saved" && "bg-blue-500",
            application?.status === "applied" && "bg-orange-300",
            application?.status === "interviewing" && "bg-yellow-700",
            application?.status === "accepted" && "bg-green-500",
            application?.status === "rejected" && "bg-red-500",
            "w-full",
          )}
        >
          {application?.status &&
            application.status.charAt(0).toUpperCase() +
              application.status.slice(1)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {statuses.map((status) => (
          <DropdownMenuItem asChild key={status as string}>
            <Button
              className="w-full disabled:opacity-100"
              variant="ghost"
              onClick={() => mutation.mutate(status)}
              disabled={status === application?.status}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
