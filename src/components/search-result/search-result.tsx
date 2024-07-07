import { Button } from "../ui/button";
import { TrashIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { deleteSearchResults } from "~/server/queries/jobs-queries";

interface SearchResultProps {
  city: string | null;
  country: string | null;
  role: string | null;
  jobSearchId: number;
  userId: string;
}

export default function SearchResult({
  role,
  city,
  country,
  jobSearchId,
  userId,
}: SearchResultProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => await deleteSearchResults(jobSearchId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["searchResults", userId],
      });
    },
  });

  return (
    <li className="border-1 flex w-full items-center justify-between rounded-md border-black bg-primary px-5 py-2 dark:border-white dark:text-black">
      <div className="flex flex-col items-start justify-center">
        <p className="text-center text-black">
          <span>Role:</span> {role ?? "N/A"}
        </p>
        <p className="text-center">
          <span>Location:</span> {city ?? "N/A"}, {country ?? "N/A"}
        </p>
      </div>
      <div className="flex items-center justify-center gap-2">
        <Link href={`/saved-searches/${jobSearchId}`}>
          <Button className="flex w-full items-center justify-center gap-x-2 bg-green-500 text-white hover:bg-green-700">
            View Jobs
            <EyeOpenIcon className="h-5 w-5" />
          </Button>
        </Link>
        <Button
          onClick={() => mutation.mutate()}
          className="flex w-full items-center justify-center gap-x-2 bg-red-500 text-white hover:bg-red-700"
        >
          {mutation.isPending ? (
            "Deleting..."
          ) : (
            <>
              Delete
              <TrashIcon className="h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </li>
  );
}
