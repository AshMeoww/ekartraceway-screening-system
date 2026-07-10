"use client";

import Link from "next/link";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Application } from "@/lib/types";

const columnHelper = createColumnHelper<Application>();

const columns = [
  columnHelper.accessor((row) => row.applicant.fullName, {
    id: "applicant",
    header: "Applicant",
  }),
  columnHelper.accessor((row) => row.applicant.email, {
    id: "email",
    header: "Email",
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => <Badge variant="secondary">{info.getValue()}</Badge>,
  }),
  columnHelper.accessor((row) => row.score?.finalScore ?? 0, {
    id: "score",
    header: "Score",
    cell: (info) => <Badge>{info.getValue()}</Badge>,
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => (
      <Button asChild size="sm" variant="outline">
        <Link href={`/hr/applications/${row.original.id}`}>Review</Link>
      </Button>
    ),
  }),
];

export function ApplicationsTable({ applications }: { applications: Application[] }) {
  const table = useReactTable({
    data: applications,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 font-bold">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t border-border">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
