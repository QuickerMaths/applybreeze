"use server";

import { Applications } from "~/server/db/schema";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";

export async function createApplication(userId: string, jobId: number) {
  const applicationId = await db
    .insert(Applications)
    .values({
      userId,
      jobId,
    })
    .returning({ id: Applications.id });

  if (!applicationId[0]?.id) {
    throw new Error("Could not create application");
  }

  return applicationId[0].id;
}

export async function getApplications(
  userId: string,
  pageSize = 10,
  cursor?: number,
) {
  return await db.query.Applications.findMany({
    where: (application, { eq, and, lt }) =>
      and(
        eq(application.userId, userId),
        cursor ? lt(application.id, cursor) : undefined,
      ),
    with: {
      job: true,
    },
    limit: pageSize,
    orderBy: (application, { desc }) => desc(application.id),
  });
}

export async function deleteApplication(applicationId: number) {
  return await db
    .delete(Applications)
    .where(eq(Applications.id, applicationId));
}

export async function updateApplicationStatus(
  applicationId: number,
  status:
    | "applied"
    | "interviewing"
    | "rejected"
    | "offered"
    | "accepted"
    | "declined",
) {
  return await db
    .update(Applications)
    .set({
      status,
    })
    .where(eq(Applications.id, applicationId));
}
