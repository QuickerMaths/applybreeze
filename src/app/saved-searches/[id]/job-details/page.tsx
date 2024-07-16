"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getJob } from "~/server/queries/jobs-queries";
import { useSearchParams } from "next/navigation";
import { getCurrentUserId } from "~/lib/getCurrentUser";

export default function JobDetails() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const userId = getCurrentUserId();

  const { data } = useQuery({
    queryKey: ["job", jobId, userId],
    queryFn: async () => await getJob(+jobId!),
  });

  return <div className="min-h-[100%] w-full bg-black">haha</div>;
}
