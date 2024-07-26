"use client";

import React from "react";
import type { Table } from "@tanstack/react-table";
import type { JobsWithApplicationsType } from "~/types/jobs";
import TableInputFilter from "../table-input-filter/table-input-filter";

interface JobsFilterProps {
    table: Table<JobsWithApplicationsType>;
}

export default function JobsFilters({ table }: JobsFilterProps) {
    return (
        <div className="grid-row-2 grid grid-cols-2 gap-2 mb-2">
            <TableInputFilter
                column={table.getColumn("title")}
                id="title"
                name="role"
                className="col-start-1 col-end-1 row-start-1 row-end-1"
            />
            <TableInputFilter
                column={table.getColumn("city")}
                id="city"
                name="city"
                className="col-start-2 col-end-2 row-start-1 row-end-1"
            />
            <TableInputFilter
                column={table.getColumn("country")}
                id="country"
                name="country"
                className="col-start-1 col-end-2 row-start-2 row-end-2"
            />
            <TableInputFilter
                column={table.getColumn("companyName")}
                id="companyName"
                name="company name"
                className="col-start-2 col-end-2 row-start-2 row-end-2"
            />
        </div>
    );
}
