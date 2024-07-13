"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getJob } from "~/server/queries/jobs-queries";

interface JobDetailsProps {
  params: {
    id: number;
    jobId: number;
    userId: string;
  };
}

export default function JobDetails({
  params: { id: _savedSearchId, jobId, userId },
}: JobDetailsProps) {
  const { data } = useQuery({
    queryKey: ["job", jobId, userId],
    queryFn: () => getJob(jobId),
  });

  console.log(data);

  return <div className="min-h-[100%] w-full bg-black">haha</div>;
}
