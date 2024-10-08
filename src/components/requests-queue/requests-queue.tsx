"use client";

import { useQuery } from "@tanstack/react-query";
import { getRequests } from "~/server/queries/request-queries";
import RequestLoader from "../request-loader/request-loader";

interface RequestsQueueProps {
  userId: string;
}

export default function RequestsQueue({ userId }: RequestsQueueProps) {
  const { data } = useQuery({
    queryKey: ["requests", userId],
    queryFn: async () => await getRequests(userId),
  });

  return (
    <div className="flex w-3/4 flex-col items-center justify-center gap-y-2">
      {data && data.length > 0 ? (
        <>
          <p>Requests are deleted automatically after 30 minutes</p>
          <p className="mb-2 text-gray-500">
            You can only start 2 concurent requests at a time.
          </p>
          <ul className="flex w-full flex-col gap-y-2">
            {data.map((request) => (
              <RequestLoader
                key={request.id}
                userId={userId}
                request={request}
              />
            ))}
          </ul>
        </>
      ) : (
        <p className="text-center">No requests found</p>
      )}
    </div>
  );
}
