"use server";

import { auth } from "@clerk/nextjs/server";
import { cache } from "react";

export const getCurrentUserId = cache(async () => {
  const { userId } = auth();
  return userId;
});
