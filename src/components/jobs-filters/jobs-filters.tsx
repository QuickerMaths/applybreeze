"use client";

import React from "react";
import type { Table } from "@tanstack/react-table";
import type { JobsWithApplicationsType } from "~/types/jobs";
import TableInputFilter from "../table-input-filter/table-input-filter";
import TableSelectFilter from "../table-select-filter/table-select-filter";
import { jobSources } from "~/constants/jobs";
import { applicationStatuses } from "~/constants/applications";

interface JobsFilterProps {
  table: Table<JobsWithApplicationsType>;
}

export default function JobsFilters({ table }: JobsFilterProps) {
  return (
    <div className="grid-row-2 mb-2 grid grid-cols-3 gap-2">
      <TableInputFilter
        column={table.getColumn("title")}
        id="title"
        name="role"
      />
      <TableInputFilter
        column={table.getColumn("city")}
        id="city"
        name="city"
        className="col-start-2 col-end-2 row-start-1 row-end-1"
      />
      <TableSelectFilter
        column={table.getColumn("applications")}
        name={"application status"}
        items={applicationStatuses}
        className="col-start-3 col-end-3 row-start-1 row-end-1"
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
      <TableSelectFilter
        column={table.getColumn("source")}
        name={"source"}
        items={jobSources}
        className="col-start-3 col-end-3 row-start-2 row-end-2"
      />
    </div>
  );
}
