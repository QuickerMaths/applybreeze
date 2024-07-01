import { db } from "~/server/db";
import { Webhook } from "svix";
import { headers } from "next/headers";
import type { UserJSON, WebhookEvent } from "@clerk/nextjs/server";
import { Users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const eventType = evt.type;
  const { id } = evt.data;

  if (eventType === "user.created") {
    await saveUser(evt);
  } else if (eventType === "user.updated" && id) {
    await updateUser(evt, id);
  } else if (eventType === "user.deleted" && id) {
    await deleteUser(id);
  }

  return new Response("Server internal error", { status: 500 });
}

async function saveUser(payload: WebhookEvent) {
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

  return new Response("OK", { status: 201 });
}

async function updateUser(payload: WebhookEvent, id: string) {
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

  return new Response("OK", { status: 204 });
}

async function deleteUser(id: string) {
  //TODO: delete data from other tables that reference this user
  await db.delete(Users).where(eq(Users.id, id));

  return new Response("OK", { status: 204 });
}
