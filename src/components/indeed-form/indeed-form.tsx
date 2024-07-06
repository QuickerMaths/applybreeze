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
import { v4 as uuidv4 } from "uuid";
import useMultiRequest from "~/hooks/useMultipleRequests";

interface IndeedFormProps {
  userId: string;
}

export default function IndeedForm({ userId }: IndeedFormProps) {
  const form = useForm<z.infer<typeof indeedSearchSchema>>({
    resolver: zodResolver(indeedSearchSchema),
    defaultValues: {
      id: "",
      role: "Frontend developer",
      location: "Warsaw",
      country: "PL",
      limit: 5,
    },
  });

  const { requests, addRequest } = useMultiRequest({
    mutationFunction: getJobs,
    endpoint: "indeed",
    userId,
  });

  function onSubmit(values: z.infer<typeof indeedSearchSchema>) {
    values.id = uuidv4();
    addRequest(values);
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
      {requests.map((request) => (
        <div key={request.id}>
          {request.status === "processing" ? (
            <p>Loading...</p>
          ) : request.status === "error" ? (
            <p>Error</p>
          ) : request.status === "completed" ? (
            <p>Success</p>
          ) : null}
        </div>
      ))}
    </>
  );
}
