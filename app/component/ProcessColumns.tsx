"use client"

import { ColumnDef } from "@tanstack/react-table"
import { StatusBadge } from "./StatusBadge"
import { Bold, Eye, SquarePen } from "lucide-react"
import Link from "next/link"
import FormDetail from "@/SampleData/form_detail.json"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type DocumentColumn = {
    id: string
    title: string
    type: string
    owner: string
    department: string
    status: "Draft" | "Approved" | "Processing" | "Completed" | "Cancelled" | "Pending" | "Rejected"
    created: string
    updated: string
}
type Status = "Draft" | "Approved" | "Processing" | "Completed" | "Cancelled" | "Pending" | "Rejected";

export const ProcessColumns = (
    setDetail: React.Dispatch<React.SetStateAction<{ open: boolean; document_id: string }>>
): ColumnDef<DocumentColumn>[] => [
        {
            accessorKey: "id",
            header: "Document ID",
            cell: ({ row }) => {

                return (
                    <button
                        className="text-[#4A4DF1] hover:cursor-pointer"
                        onClick={() => setDetail({open: true, document_id: row.original.id})}
                    >
                        {row.original.id}
                    </button>
                )
            }
        },
        {
            accessorKey: "title",
            header: "Title",
        },
        {
            accessorKey: "type",
            header: "Type",
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
        }
    ]