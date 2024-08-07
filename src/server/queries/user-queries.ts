"use server";

import type { WebhookEvent, UserJSON } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { eq, inArray } from "drizzle-orm";
import { SavedSearches, SavedSearchJobs, Jobs, Users } from "../db/schema";

export async function saveUser(payload: WebhookEvent) {
    const user = payload.data as UserJSON;

    const email = user.email_addresses.find(
        (email) => email.id === user.primary_email_address_id,
    );

    if (!email) {
        return;
    }

    await db.insert(Users).values({
        id: user.id,
        email: email.email_address,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username ?? null,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at),
    });
}

export async function updateUser(payload: WebhookEvent, id: string) {
    const user = payload.data as UserJSON;

    const email = user.email_addresses.find(
        (email) => email.id === user.primary_email_address_id,
    );

    if (!email) {
        return;
    }

    await db
        .update(Users)
        .set({
            id: user.id,
            email: email.email_address,
            firstName: user.first_name,
            lastName: user.last_name,
            username: user.username ?? null,
            createdAt: new Date(user.created_at),
            updatedAt: new Date(user.updated_at),
        })
        .where(eq(Users.id, id));
}

export async function deleteUser(id: string) {
    const savedSearchId = await db
        .select({ id: SavedSearches.id })
        .from(SavedSearches)
        .where(eq(SavedSearches.userId, id));

    if (!savedSearchId[0]?.id) return;

    const jobIds = await db
        .select({ jobId: SavedSearchJobs.jobId })
        .from(SavedSearchJobs)
        .where(eq(SavedSearchJobs.savedSearchId, savedSearchId[0].id));

    await db
        .delete(SavedSearchJobs)
        .where(eq(SavedSearchJobs.savedSearchId, savedSearchId[0].id));

    if (jobIds.length > 0) {
        await db.delete(Jobs).where(
            inArray(
                Jobs.id,
                jobIds.map((job) => job.jobId),
            ),
        );
    }

    await db
        .delete(SavedSearches)
        .where(eq(SavedSearches.userId, id))
        .returning({ id: SavedSearches.id });

    await db.delete(Users).where(eq(Users.id, id));
}
