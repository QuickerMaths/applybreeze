"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteJob } from "~/server/queries/jobs-queries";
import { TrashIcon } from "lucide-react";
import { Button } from "../ui/button";

interface DeleteJobProps {
  jobId: number;
  userId: string;
}

export default function DeleteJob({ jobId, userId }: DeleteJobProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      return await deleteJob(jobId);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["jobs", userId],
      });
    },
  });

  return (
    <Button
      variant="destructive"
      className="text-primary dark:text-primary"
      onClick={() => mutation.mutate()}
    >
      {mutation.isPending ? "Deleting..." : <TrashIcon />}
    </Button>
  );
}
