"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { indeedSearchSchema } from "~/schemas/indeed";
import { getJobs } from "~/server/mutations/jobs-mutation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferSelectModel } from "drizzle-orm";
import type { JobSearchRequest } from "~/server/db/schema";
import { getSavedSearches } from "~/server/queries/jobs-queries";

interface IndeedFormProps {
  userId: string;
}

export default function IndeedForm({ userId }: IndeedFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof indeedSearchSchema>>({
    resolver: zodResolver(indeedSearchSchema),
    defaultValues: {
      role: "Frontend developer",
      location: "Warsaw",
      country: "PL",
      limit: 5,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof indeedSearchSchema>) =>
      getJobs(values, "indeed"),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["requests", userId] });

      const savedSearchId = await getSavedSearches(userId, form.getValues());

      queryClient.setQueryData(
        ["requests", userId],
        (old: InferSelectModel<typeof JobSearchRequest>[]) => {
          const newRequest = {
            id: Date.now(), // temporary id
            status: "pending",
            savedSearchId,
            savedSearch: {
              role: form.getValues("role"),
              city: form.getValues("location"),
              country: form.getValues("country"),
            },
          };
          return [...(old || []), newRequest];
        },
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["requests", userId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["searchResults", userId],
      });
    },
  });

  async function onSubmit(values: z.infer<typeof indeedSearchSchema>) {
    mutation.mutate(values);
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 grid-rows-3 gap-3"
        >
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input placeholder="Frontend developer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Warsaw" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="PL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Limit</FormLabel>
                <FormControl>
                  <Input placeholder="5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="col-start-1 col-end-3 row-start-3 row-end-3"
            type="submit"
          >
            Submit
          </Button>
        </form>
      </Form>
    </>
  );
}
