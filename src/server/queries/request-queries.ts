"use server";

import { sql, eq } from "drizzle-orm";
import { JobSearchRequest } from "../db/schema";
import { db } from "~/server/db";

export async function createSearchRequest(
  savedSearchId: number,
  userId: string,
) {
  const request = await db
    .insert(JobSearchRequest)
    .values({
      userId,
      savedSearchId,
      status: "pending",
      expiresAt: sql`CURRENT_TIMESTAMP + INTERVAL '30 MINUTES'`,
      createdAt: sql`CURRENT_TIMESTAMP`,
    })
    .returning({ id: JobSearchRequest.id });

  if (!request[0]?.id) {
    throw new Error("Could not create search request");
  }

  return request[0].id;
}

export async function updateSearchRequestStatus(
  requestId: number,
  status: "completed" | "failed",
) {
  return await db
    .update(JobSearchRequest)
    .set({
      status,
    })
    .where(eq(JobSearchRequest.id, requestId));
}

export async function getRequests(userId: string) {
  return await db.query.JobSearchRequest.findMany({
    where: (request, { eq }) => eq(request.userId, userId),
    with: {
      savedSearch: {
        columns: {
          role: true,
          city: true,
          country: true,
        },
      },
    },
  });
}

export async function getPendingRequests(userId: string) {
  return await db.query.JobSearchRequest.findMany({
    where: (request, { eq, and }) =>
      and(eq(request.userId, userId), eq(request.status, "pending")),
    with: {
      savedSearch: {
        columns: {
          role: true,
          city: true,
          country: true,
        },
      },
    },
  });
}

export async function completeRequest(requestId: number) {
  await db.delete(JobSearchRequest).where(eq(JobSearchRequest.id, requestId));
}

export async function deleteExpiredRequests() {
  await db
    .delete(JobSearchRequest)
    .where(
      sql`expires_at < CURRENT_TIMESTAMP AND status = 'pending' OR status = 'failed'`,
    );
}
