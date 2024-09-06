import { db } from "~/server/db/index";
import { ApplicationsAnalytics } from "../db/schema";
import { and, asc, desc, eq, gte, or } from "drizzle-orm";

export async function getAnalytics(userId: string, months: number) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    return await db
        .select()
        .from(ApplicationsAnalytics)
        .where(
            or(
                and(
                    eq(ApplicationsAnalytics.year, currentYear),
                    gte(ApplicationsAnalytics.month, currentMonth - months + 1),
                ),
                and(
                    eq(ApplicationsAnalytics.year, currentYear - 1),
                    gte(ApplicationsAnalytics.month, 12 - (months - currentMonth)),
                ),
                and(eq(ApplicationsAnalytics.userId, userId)),
            ),
        )
        .orderBy(desc(ApplicationsAnalytics.year), asc(ApplicationsAnalytics.month))
        .limit(months);
}

export async function updateAnalytics(
    userId: string,
    month = new Date().getMonth(),
    year = new Date().getFullYear(),
    applicationCount = 0,
    savedCount = 0,
) {
    const analytics = await checkAnalytics(userId, month + 1, year);

    await db
        .update(ApplicationsAnalytics)
        .set({
            appliedApplications: analytics.appliedApplications + applicationCount,
            savedApplications: analytics.savedApplications + savedCount,
        })
        .where(eq(ApplicationsAnalytics.id, analytics.id));
}

async function checkAnalytics(
    userId: string,
    month = new Date().getMonth(),
    year = new Date().getFullYear(),
): Promise<{
    id: number;
    appliedApplications: number;
    savedApplications: number;
}> {
    const analytics = await db.query.ApplicationsAnalytics.findFirst({
        columns: {
            id: true,
            appliedApplications: true,
            savedApplications: true,
        },
        where: (analytics, { and, eq }) =>
            and(
                eq(analytics.month, month),
                eq(analytics.year, year),
                eq(analytics.userId, userId),
            ),
    });

    if (!analytics) {
        const analytics = await db
            .insert(ApplicationsAnalytics)
            .values({
                userId,
                month,
                year,
                appliedApplications: 0,
                savedApplications: 0,
            })
            .returning({
                id: ApplicationsAnalytics.id,
                appliedApplications: ApplicationsAnalytics.appliedApplications,
                savedApplications: ApplicationsAnalytics.savedApplications,
            });

        return analytics[0]!;
    }

    return analytics;
}
