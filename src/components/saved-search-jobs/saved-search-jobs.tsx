"use client";

import { useQuery } from "@tanstack/react-query";
import { getPendingRequests } from "~/server/queries/request-queries";
import RequestLoader from "../request-loader/request-loader";
import JobsTable from "../jobs-table/jobs-table";

interface SavedSearchJobsProps {
  userId: string;
}
export default function SavedSearchJobs({ userId }: SavedSearchJobsProps) {
  const { data: pendingRequestsData } = useQuery({
    queryKey: ["requests", userId],
    queryFn: async () => await getPendingRequests(userId),
  });

  return (
    <div className="mx-auto flex flex-col items-center justify-center">
      {pendingRequestsData && pendingRequestsData.length > 0 && (
        <>
          <h2 className="mb-2 text-2xl font-bold text-primary dark:text-primary">
            Pending requests
          </h2>
          <ul className="mb-2 flex w-full flex-col gap-y-2">
            {pendingRequestsData.map((request) => (
              <RequestLoader
                key={request.id}
                userId={userId}
                request={request}
                isInSavedSearchJobs
              />
            ))}
          </ul>
        </>
      )}
      <JobsTable userId={userId} />
    </div>
  );
}
