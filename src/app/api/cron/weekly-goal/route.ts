import { restartWeeklyGoal } from "~/server/queries/weekly-goal-queries";

export async function POST() {
    try {
        await restartWeeklyGoal();

        return new Response("OK", { status: 200 });
    } catch (error) {
        return new Response("Failed to delete expired requests", { status: 500 });
    }
}
