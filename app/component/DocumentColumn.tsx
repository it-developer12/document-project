"use client"

import { ColumnDef } from "@tanstack/react-table"
import { StatusBadge } from "./StatusBadge"
import { SquarePen } from "lucide-react"
import Link from "next/link"
import { PriorityBadge } from "./PriorityBadge"
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc);
dayjs.extend(timezone);

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type DocumentColumn = {
  id: string
  title: string
  priority: "low" | "medium" | "high"
  company: string
  owner: string
  department: string
  status: "WAITING_APPROVAL" | "PROCESSING" | "REJECTED" | "CANCELLED" | "COMPLETED"
  created: string
  updated: string
  end_date: string
  type: string;
  schema_id: string;
}
type Priority = "low" | "medium" | "high"
type Status = "WAITING_APPROVAL" | "PROCESSING" | "REJECTED" | "CANCELLED" | "COMPLETED";

const COMPANY_LABELS: Record<string, string> = {
  ctx: "Ctx holding",
  cff: "Cityfresh Fruits",
  nbm: "Noble marketing",
}

export const columns: ColumnDef<DocumentColumn>[] = [
  {
    accessorKey: "id",
    header: "Document ID",
    cell: ({ row }) => {
      return (
        <Link href={`/document_list/it/form?schema_id=${row.original.schema_id}&doc_id=${row.original.id}&mode=view`}>
          <span style={{ color: "#4A4DF1" }}>{row.original.id}</span>
        </Link>
      )
    }
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => <PriorityBadge status={row.original.priority as Priority} />
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => <span>{COMPANY_LABELS[row.original.company] ?? ""}</span>
  },
  {
    accessorKey: "owner",
    header: "Owner",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status as Status} />
  },
  {
    accessorKey: "updated",
    header: "Last Updated",
    cell: ({ row }) => {
      const stringDate = dayjs.utc(row.original.updated).tz("Asia/Bangkok").format("DD-MM-YYYY")
      return (
        <span>{stringDate}</span>
      )
    }
  },
  {
    accessorKey: "end_date",
    header: "วันที่สิ้นสุดเอกสาร",
    cell: ({ row }) => {
      const stringDate = dayjs.utc(row.original.end_date).tz("Asia/Bangkok").format("DD-MM-YYYY")
      return (
        <span>{stringDate}</span>
      )
    }
  },
  {
    accessorKey: "view_or_edit",
    header: "",
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 items-center">
          {/* <Link href={`/document_list/it/form?schema_id=${schema_id}&doc_id=${row.original.id}&mode=view`}>
            <Eye />
          </Link> */}
          {row.original.status === "REJECTED" && (
            <Link href={`/document_list/it/form?schema_id=${row.original.schema_id}&doc_id=${row.original.id}&mode=edit`}>
              <SquarePen />
            </Link>
          )}
        </div>
      )
    }
  }
]
