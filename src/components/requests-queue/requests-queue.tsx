"use client";

import { useQuery } from "@tanstack/react-query";
import { getRequests } from "~/server/queries/jobs-queries";

interface RequestsQueueProps {
  userId: string;
}

export default function RequestsQueue({ userId }: RequestsQueueProps) {
  const { data } = useQuery({
    queryKey: ["requests", userId],
    queryFn: async () => await getRequests(userId),
  });

  return (
    <ul className="flex flex-col items-center justify-center gap-y-2">
      {data?.map((request) => (
        <li key={request.id}>
          {request.status === "pending" ? (
            <p>Request {request.id} is pending</p>
          ) : (
            <p>Request {request.id} is complete</p>
          )}
        </li>
      ))}
    </ul>
  );
}
