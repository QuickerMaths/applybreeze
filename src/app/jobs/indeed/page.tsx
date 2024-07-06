import React from "react";
import IndeedForm from "~/components/indeed-form/indeed-form";
import { getCurrentUserId } from "~/lib/getCurrentUser";

export default async function Indeed() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return (
    <main className="my-10 flex min-h-screen flex-col items-center bg-background dark:bg-background">
      <IndeedForm userId={userId} />
    </main>
  );
}
