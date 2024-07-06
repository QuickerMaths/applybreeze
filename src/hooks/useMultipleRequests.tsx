import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import type { TypeOf, z, ZodType } from "zod";
import type { indeedSearchSchema } from "~/schemas/indeed";
import type { AxiosResponse } from "axios";

interface useMultiRequestProps {
  mutationFunction: <T extends ZodType>(
    values: TypeOf<T>,
    endpoint: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Promise<AxiosResponse<any, any>>;
  endpoint: string;
  userId: string;
}

export interface RequestState {
  id: string;
  status: "processing" | "completed" | "error";
}

const useMultiRequest = ({
  mutationFunction,
  endpoint,
  userId,
}: useMultiRequestProps) => {
  const queryClient = useQueryClient();
  const [requests, setRequests] = useState<RequestState[]>([]);

  const { mutate } = useMutation({
    mutationFn: (values: z.infer<typeof indeedSearchSchema>) =>
      mutationFunction(values, endpoint),
    onMutate: (requestData) => {
      setRequests((prev) => [
        ...prev,
        { id: requestData.id, status: "processing" },
      ]);
    },
    onSuccess: async (_data, requestData) => {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestData.id ? { ...req, status: "completed" } : req,
        ),
      );
      await queryClient.invalidateQueries({
        queryKey: ["searchResults", userId],
      });
    },
    onError: (_error, requestData) => {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestData.id ? { ...req, status: "error" } : req,
        ),
      );
    },
  });

  const addRequest = (requestData: z.infer<typeof indeedSearchSchema>) => {
    mutate(requestData);
  };

  return { requests, addRequest };
};

export default useMultiRequest;
