import { deleteExpiredRequests } from "~/server/queries/jobs-queries";

export async function POST() {
  try {
    await deleteExpiredRequests();

    return new Response("OK", { status: 200 });
  } catch (error) {
    return new Response("Failed to delete expired requests", { status: 500 });
  }
}
