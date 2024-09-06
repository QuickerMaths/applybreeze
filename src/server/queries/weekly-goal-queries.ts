"use server";

import { db } from "~/server/db/index";
import { WeeklyGoal } from "../db/schema";
import { eq } from "drizzle-orm";

export async function createWeeklyGoal(userId: string, goal = 10) {
    const weeklyGoal = await db
        .insert(WeeklyGoal)
        .values({ userId, goal, progress: 0 })
        .returning({ id: WeeklyGoal.id, progress: WeeklyGoal.progress });

    return weeklyGoal[0];
}

export async function updateWeeklyGoal(userId: string) {
    const existingGoal = await getWeeklyGoal(userId);

    if (!existingGoal) {
        await createWeeklyGoal(userId);

        const updatedGoal = await db
            .update(WeeklyGoal)
            .set({ progress: 1 })
            .where(eq(WeeklyGoal.userId, userId))
            .returning({ id: WeeklyGoal.id, progress: WeeklyGoal.progress });

        return updatedGoal[0];
    }

    const updatedGoal = await db
        .update(WeeklyGoal)
        .set({ progress: existingGoal.progress + 1 })
        .where(eq(WeeklyGoal.userId, userId))
        .returning({ id: WeeklyGoal.id, progress: WeeklyGoal.progress });

    return updatedGoal[0];
}

export async function changeWeeklyGoal(userId: string, newGoal: number) {
    const existingGoal = await getWeeklyGoal(userId);

    if (!existingGoal) {
        return await createWeeklyGoal(userId, newGoal);
    }

    const updatedGoal = await db
        .update(WeeklyGoal)
        .set({ goal: newGoal })
        .where(eq(WeeklyGoal.userId, userId))
        .returning({ id: WeeklyGoal.id, goal: WeeklyGoal.goal });

    return updatedGoal[0];
}

export async function getWeeklyGoal(userId: string) {
    const weeklyGoal = await db.query.WeeklyGoal.findFirst({
        where: (goal, { eq }) => eq(goal.userId, userId),
        columns: {
            id: true,
            progress: true,
            goal: true,
        },
    });

    return weeklyGoal;
}

export async function restartWeeklyGoal() {
    // eslint-disable-next-line drizzle/enforce-update-with-where
    await db.update(WeeklyGoal).set({ progress: 0 });
}
