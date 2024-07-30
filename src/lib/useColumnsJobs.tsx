"use client";

import type { JobsWithApplicationsType } from "~/types/jobs";
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";
import StatusSelect from "~/components/status-select/status-select";

const jobsColumnsHelper = createColumnHelper<JobsWithApplicationsType>();

export default function useJobsColumns(userId: string) {
    const jobsColumns = useMemo(
        () => [
            jobsColumnsHelper.accessor("title", {
                header: "Role",
                cell: (props) => (
                    <div className="max-w-[175px] truncate">{props.getValue()}</div>
                ),
            }),
            jobsColumnsHelper.accessor("city", {
                header: "City",
                cell: (props) => props.getValue(),
            }),
            jobsColumnsHelper.accessor("country", {
                header: "Country",
                cell: (props) => props.getValue(),
            }),
            jobsColumnsHelper.accessor((row) => row.salary ?? "Unknown", {
                header: "Salary",
                cell: (props) => props.getValue(),
            }),
            jobsColumnsHelper.accessor("source", {
                header: "Source",
                cell: (props) =>
                    props?.getValue()?.charAt(0).toUpperCase() +
                    props?.getValue()?.slice(1),
            }),
            jobsColumnsHelper.accessor("seniorityLevel", {
                header: "Experience",
                cell: (props) =>
                    props.getValue()?.charAt(0).toUpperCase() +
                    props.getValue()?.slice(1),
            }),
            jobsColumnsHelper.accessor("companyName", {
                header: "Company Name",
                cell: (props) => props.getValue(),
            }),
            jobsColumnsHelper.accessor((row) => row.url ?? row.sourceUrl, {
                header: "Url",
                enableSorting: false,
                cell: (props) => (
                    <div className="max-w-[100px] truncate">
                        <a href={props.getValue()!} target="_blank">
                            {props.getValue()}
                        </a>
                    </div>
                ),
            }),
            jobsColumnsHelper.accessor("applications.status", {
                id: "applications",
                header: "Status",
                cell: (props) => (
                    <StatusSelect userId={userId} jobId={props.row.original.id} />
                ),
            }),
        ],
        [userId],
    );

    return jobsColumns;
}
