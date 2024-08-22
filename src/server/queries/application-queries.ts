"use server";

import { Applications } from "~/server/db/schema";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import type { ApplicationStatusType } from "~/types/applications";
import { updateAnalytics } from "./analytics-queries";

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

export async function getApplicationStatus(jobId: number) {
  return await db.query.Applications.findFirst({
    where: (application, { eq }) => eq(application.jobId, jobId),
  });
}

export async function updateApplicationStatus(
  userId: string,
  applicationId: number,
  status: ApplicationStatusType,
) {
  const appliedDate = await db
    .update(Applications)
    .set({
      status,
    })
    .where(eq(Applications.id, applicationId))
    .returning({ appliedDate: Applications.appliedDate });

  if (status === "saved" && appliedDate[0]) {
    const applicationMonth =
      new Date(appliedDate[0].toLocaleString()).getMonth() + 1;
    const applicationYear = new Date(
      appliedDate[0].toLocaleString(),
    ).getFullYear();

    await updateAnalytics(userId, applicationMonth, applicationYear, -1);
  }

  await updateAnalytics(
    userId,
    new Date().getMonth(),
    new Date().getFullYear(),
    1,
  );
}
