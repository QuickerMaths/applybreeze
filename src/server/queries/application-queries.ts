"use server";

import { Applications } from "~/server/db/schema";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import type { ApplicationStatusType } from "~/types/applications";
import { updateAnalytics } from "./analytics-queries";
import { updateWeeklyGoal } from "./weekly-goal-queries";

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
    // check if already applied
    const date = await db.query.Applications.findFirst({
        where: (application, { eq }) => eq(application.id, applicationId),
    });

    if (date?.appliedDate) {
        // if not update application status, analytics and weeklygoal
        const application = await db
            .update(Applications)
            .set({ status })
            .where(eq(Applications.id, applicationId))
            .returning({ id: Applications.id });

        return application[0];
    } else {
        // if yes update application status
        const application = await db
            .update(Applications)
            .set({ status, appliedDate: new Date() })
            .where(eq(Applications.id, applicationId))
            .returning({ id: Applications.id });

        await updateAnalytics(
            userId,
            new Date().getMonth(),
            new Date().getFullYear(),
            1,
        );

        await updateWeeklyGoal(userId);

        return application[0];
    }
}
