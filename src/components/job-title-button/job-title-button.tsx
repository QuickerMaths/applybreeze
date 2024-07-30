"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import useCreateQueryString from "~/hooks/useCreateQueryString";
import { Button } from "../ui/button";
import type { SavedSearchJobsType } from "~/types/saved-searches";

interface JobTitleButtonProps {
  job: SavedSearchJobsType;
  userId: string;
}

export default function JobTitleButton({ job, userId }: JobTitleButtonProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const createQueryString = useCreateQueryString();
  return (
    <Button
      variant="link"
      className="text-left"
      onClick={async () => {
        router.push(
          pathname + "?" + createQueryString({ jobId: job.id, userId }),
        );
        await queryClient.invalidateQueries({
          queryKey: ["job", job.id, userId],
        });
      }}
    >
      {job.job.title}
    </Button>
  );
}
