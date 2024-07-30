"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Form, FormField, FormItem } from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import type { ApplicationStatusType } from "~/types/applications";
import { cn } from "~/lib/utils";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  getApplicationStatus,
  updateApplicationStatus,
} from "~/server/queries/application-queries";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationStatuses } from "~/constants/applications";

interface StatusSelectProps {
  userId: string;
  jobId: number;
}

export default function StatusSelect({ userId, jobId }: StatusSelectProps) {
  const queryClient = useQueryClient();

  const applicationStatusSchema = z.object({
    applicationStatus: z.enum(applicationStatuses),
  });

  const {
    data: application,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["applicationStatus", jobId],
    queryFn: () => getApplicationStatus(jobId),
  });

  const mutation = useMutation({
    mutationFn: (applicationStatus: ApplicationStatusType) =>
      updateApplicationStatus(jobId, applicationStatus),
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["jobs", userId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["applicationStatus", jobId],
      });
    },
  });

  const form = useForm<z.infer<typeof applicationStatusSchema>>({
    resolver: zodResolver(applicationStatusSchema),
  });

  const onSubmit = (values: z.infer<typeof applicationStatusSchema>) => {
    mutation.mutate(values.applicationStatus);
  };

  useEffect(() => {
    if (application?.status) {
      form.setValue("applicationStatus", application.status);
    }
  }, [application, form]);

  if (isLoading || isRefetching) {
    return <p>Loading...</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="applicationStatus"
          render={() => (
            <FormItem>
              <Controller
                name="applicationStatus"
                control={form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={async (value: ApplicationStatusType) => {
                      field.onChange(value);
                      await form.handleSubmit(onSubmit)();
                    }}
                    value={field.value}
                  >
                    <SelectTrigger
                      className={cn(
                        "flex w-full items-center justify-center gap-2",
                        application?.status === "saved" && "bg-blue-500",
                        application?.status === "applied" && "bg-orange-300",
                        application?.status === "interviewing" &&
                          "bg-yellow-700",
                        application?.status === "accepted" && "bg-green-500",
                        application?.status === "rejected" && "bg-red-500",
                      )}
                    >
                      {application?.status &&
                        application.status.charAt(0).toUpperCase() +
                          application.status.slice(1)}
                    </SelectTrigger>
                    <SelectContent>
                      {applicationStatuses.map((status) => (
                        <SelectItem
                          value={status}
                          key={status}
                          className="w-full disabled:opacity-50"
                          disabled={status === application?.status}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
