"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import JobTitleButton from "~/components/job-title-button/job-title-button";
import type { SavedSearchJobsType } from "~/types/saved-searches";

const titlesColumnsHelper = createColumnHelper<SavedSearchJobsType>();

export default function useColumnsTitles(userId: string) {
  const titlesColumns = useMemo(
    () => [
      titlesColumnsHelper.accessor("job", {
        header: "Role",
        cell: (props) => (
          <JobTitleButton job={props.row.original} userId={userId} />
        ),
      }),
    ],
    [userId],
  );

  return titlesColumns;
}
