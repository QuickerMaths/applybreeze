import React from "react";
import type { Column } from "@tanstack/react-table";
import type { JobsWithApplicationsType } from "~/types/jobs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import type { ApplicationStatusType } from "~/types/applications";
import type { applicationStatuses } from "~/constants/applications";
import type { jobSources } from "~/constants/jobs";

interface TableSelectFilterProps {
  column: Column<JobsWithApplicationsType, unknown> | undefined;
  name: string;
  items: typeof applicationStatuses | typeof jobSources;
  className?: string;
}

export default function TableSelectFilter({
  column,
  name,
  items,
  className,
}: TableSelectFilterProps) {
  return (
    <div className={className}>
      <Select
        onValueChange={(value: ApplicationStatusType) => {
          column?.setFilterValue(value);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={`Filter ${name}...`} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem
              value={item}
              key={item}
              className="w-full disabled:opacity-50"
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
