"use client";

import React, { useState, useEffect } from "react";
import type { Column } from "@tanstack/react-table";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import type { JobsWithApplicationsType } from "~/types/jobs";
import { cn } from "~/lib/utils";

interface TableInputFilterProps {
    column: Column<JobsWithApplicationsType, unknown> | undefined;
    id: string;
    name: string;
    className?: string;
    debounce?: number;
}

export default function TableInputFilter({
    column,
    id,
    name,
    className,
    debounce = 500,
}: TableInputFilterProps) {
    const [value, setValue] = useState("");
    const columnFilterValue = column?.getFilterValue();

    useEffect(() => {
        if (columnFilterValue !== value) {
            const timeout = setTimeout(() => {
                column?.setFilterValue(value);
            }, debounce);

            return () => clearTimeout(timeout);
        }
    }, [value, debounce, columnFilterValue, column]);

    return (
        <>
            <Label className="sr-only" htmlFor={id}>
                {id}
            </Label>
            <Input
                id={id}
                type="text"
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Filter ${name}...`}
                value={value}
                className={cn("placeholder:text-white", className)}
            />
        </>
    );
}
