"use client"

import { ColumnDef } from "@tanstack/react-table"
import { StatusBadge } from "./StatusBadge"
import { SquarePen } from "lucide-react"
import Link from "next/link"
import FormDetail from "@/SampleData/form_detail.json"
import { PriorityBadge } from "./PriorityBadge"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type DocumentColumn = {
  id: string
  title: string
  priority: "low" | "medium" | "high"
  company: string
  owner: string
  department: string
  status: "Draft" | "Approved" | "Processing" | "Completed" | "Cancelled" | "Pending" | "Rejected"
  created: string
  updated: string
}
type Priority = "low" | "medium" | "high"
type Status = "Draft" | "Approved" | "Processing" | "Completed" | "Cancelled" | "Pending" | "Rejected";

const SCHEMA_ID_BY_DOCUMENT_ID = new Map(
  FormDetail.map((form: any) => [form.document_id, form.schema_id]),
)

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
      const schema_id = SCHEMA_ID_BY_DOCUMENT_ID.get(row.original.id)
      return (
        <Link href={`/document_list/it/form?schema_id=${schema_id}&doc_id=${row.original.id}&mode=view`}>
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
  },
  {
    accessorKey: "end_date",
    header: "วันที่สิ้นสุดเอกสาร"
  },
  {
    accessorKey: "view_or_edit",
    header: "",
    enableSorting: false,
    cell: ({ row }) => {
      const schema_id = SCHEMA_ID_BY_DOCUMENT_ID.get(row.original.id)
      return (
        <div className="flex gap-2 items-center">
          {/* <Link href={`/document_list/it/form?schema_id=${schema_id}&doc_id=${row.original.id}&mode=view`}>
            <Eye />
          </Link> */}
          {row.original.status === "Rejected" || row.original.status === "Draft" && (
            <Link href={`/document_list/it/form?schema_id=${schema_id}&doc_id=${row.original.id}&mode=edit`}>
              <SquarePen />
            </Link>
          )}
        </div>
      )
    }
  }
]
