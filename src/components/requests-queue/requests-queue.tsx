"use client";

import { useQuery } from "@tanstack/react-query";
import { getRequests } from "~/server/queries/jobs-queries";
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
    <ul className="flex w-3/4 flex-col items-center justify-center gap-y-2">
      {data?.map((request) => (
        <RequestLoader key={request.id} userId={userId} request={request} />
      ))}
    </ul>
  );
}
