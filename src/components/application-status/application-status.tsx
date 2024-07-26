"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ChevronRight, ChevronDown, X, Check } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApplicationStatus } from "~/server/queries/application-queries";
import { cn } from "~/lib/utils";
import { updateApplicationStatus } from "~/server/queries/application-queries";
import type { ApplicationStatusType } from "~/types/applications";
import { Button } from "../ui/button";

interface ApplicationStatusProps {
  jobId: number;
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

  const status = data?.status;

  return (
    <Breadcrumb>
      <BreadcrumbList className="rounded-md border-[1px] border-white text-primary">
        <BreadcrumbItem
          className={cn("rounded-md", status === "saved" && "bg-green-500")}
        >
          <Button
            variant="ghost"
            onClick={() => mutation.mutate("saved")}
            disabled={status === "saved"}
            className="rounded-md disabled:opacity-100"
          >
            Saved
          </Button>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight />
        </BreadcrumbSeparator>
        <BreadcrumbItem
          className={cn("rounded-md", status === "applied" && "bg-green-500")}
        >
          <Button
            variant="ghost"
            onClick={() => mutation.mutate("applied")}
            disabled={status === "applied"}
            className="rounded-md disabled:opacity-100"
          >
            Applied
          </Button>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight />
        </BreadcrumbSeparator>
        <BreadcrumbItem
          className={cn(
            "rounded-md",
            status === "interviewing" && "bg-green-500",
          )}
        >
          <Button
            variant="ghost"
            onClick={() => mutation.mutate("interviewing")}
            disabled={status === "interviewing"}
            className="disabled:opacity-100 "
          >
            Interviewing
          </Button>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center gap-1",
                status === "accepted" && "bg-green-500",
                status === "rejected" && "bg-red-500",
              )}
              asChild
            >
              <Button variant="ghost">
                Decision
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                className={cn(
                  "flex items-center gap-1",
                  status === "accepted" && "bg-green-500",
                )}
              >
                <Button
                  variant="ghost"
                  onClick={() => mutation.mutate("accepted")}
                  disabled={status === "accepted"}
                  className="disabled:opacity-100"
                >
                  Accepted
                  <Check />
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(
                  "flex items-center gap-1",
                  status === "rejected" && "bg-red-500",
                )}
              >
                <Button
                  variant="ghost"
                  onClick={() => mutation.mutate("rejected")}
                  disabled={status === "rejected"}
                  className="disabled:opacity-100"
                >
                  Rejected
                  <X />
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
