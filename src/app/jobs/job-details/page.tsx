"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getJob } from "~/server/queries/jobs-queries";
import { useSearchParams } from "next/navigation";
import { ScrollArea } from "~/components/ui/scroll-area";
import JobDescription from "~/components/job-description/job-description";
import ApplicationStatus from "~/components/application-status/application-status";

export default function JobDetails() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const userId = searchParams.get("userId");

  const { data, isLoading } = useQuery({
    queryKey: ["job", jobId, userId],
    queryFn: async () => await getJob(+jobId!),
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col items-start justify-center gap-y-5 p-5">
      <h1 className="text-3xl font-bold text-primary dark:text-primary">
        Job Details
      </h1>
      <ApplicationStatus jobId={+jobId!} />
      <ScrollArea className="flex h-[700px] w-full flex-col items-start justify-center">
        <div className="flex flex-col items-center justify-center gap-y-2">
          {data && (
            <div>
              <h2 className="mb-2 text-2xl font-bold text-primary dark:text-primary">
                {data.title}
              </h2>
              <p className="text-md text-primary dark:text-primary">
                <span className="text-xl font-bold text-gray-500">
                  Location:{" "}
                </span>
                {data.country}, {data.city}
              </p>
              <p className="text-md text-primary dark:text-primary">
                <span className="text-xl font-bold text-gray-500">
                  Company:{" "}
                </span>
                {data.companyName}
              </p>
              <p className="text-md text-primary dark:text-primary">
                <span className="text-xl font-bold text-gray-500">
                  Salary:{" "}
                </span>
                {data.salary ?? "Not specified"}
              </p>
              <p className="text-md text-primary dark:text-primary">
                <span className="text-xl font-bold text-gray-500">
                  Seniority Level:{" "}
                </span>
                {data.seniorityLevel ?? "Not specified"}
              </p>
              <div className="flex items-center justify-start gap-x-2">
                <span className="text-xl font-bold text-gray-500">
                  Job Offer:{" "}
                </span>
                <a
                  className="text-md"
                  href={data.sourceUrl ?? data.url!}
                  target=" _blank"
                >
                  {data.sourceUrl ?? data.url}
                </a>
              </div>
              <p className="text-md text-primary dark:text-primary">
                <span className="text-xl font-bold text-gray-500">
                  Description:{" "}
                </span>
              </p>
              <JobDescription description={data.description!} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
