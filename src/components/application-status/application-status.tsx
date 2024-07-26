"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApplicationStatus } from "~/server/queries/application-queries";
import { cn } from "~/lib/utils";
import { updateApplicationStatus } from "~/server/queries/application-queries";
import type { ApplicationStatusType } from "~/types/applications";
import { Button } from "../ui/button";
import { applicationStatuses } from "~/constants/applications";

interface ApplicationStatusProps {
  jobId: number;
  userId: string;
}

export default function ApplicationStatus({ jobId }: ApplicationStatusProps) {
  const queryClient = useQueryClient();
  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ["applicationStatus", jobId],
    queryFn: async () => await getApplicationStatus(jobId),
  });

  const mutation = useMutation({
    mutationFn: async (status: ApplicationStatusType) => {
      if (!data?.id) {
        return;
      }
      return await updateApplicationStatus(data.id, status);
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

  const currentStatus = data?.status;

  return (
    <Breadcrumb>
      <BreadcrumbList className="rounded-md border-[1px] border-white text-primary">
        {applicationStatuses.map((status) => (
          <>
            <BreadcrumbItem
              className={cn(
                status === "saved" && "bg-blue-500",
                status === "applied" && "bg-orange-300",
                status === "interviewing" && "bg-yellow-700",
                status === "accepted" && "bg-green-500",
                status === "rejected" && "bg-red-500",
                "rounded-md",
              )}
            >
              <Button
                variant="ghost"
                onClick={() => mutation.mutate(status)}
                disabled={status === currentStatus}
                className="rounded-md disabled:opacity-100"
              >
                Saved
              </Button>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight />
            </BreadcrumbSeparator>
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
