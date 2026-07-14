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

export const columns: ColumnDef<DocumentColumn>[] = [
    {
        accessorKey: "id",
        header: "Document ID",
        cell: ({ row }) => {
            const schema_id = FormDetail.find((form: any) => form.document_id === row.original.id)?.schema_id
            return (
                <Link href={`/document_list/it/form?schema_id=${schema_id}&doc_id=${row.original.id}&mode=approve`}>
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
    },
    {
        accessorKey: "view_or_edit",
        header: "ผู้ที่อนุมัติแล้ว",
        cell: ({ row }) => {
            const formApprover = FormDetail.find((form: any) => form.document_id === row.original.id)?.approval.steps
            const isApproved = formApprover?.filter((step: any) => step.status === "approved") ?? []
            return (
                <div className="items-center flex text-nowrap overflow-x-scroll w-40 scrollbar-none text-overflow-hidden gap-1">
                    {isApproved.length > 0 && isApproved.map((approver: any, index: number) => (
                        <div className="rounded-full p-0.5 px-1 bg-green-400 text-white" key={index}>
                            <span>{approver.approvers[0].name}</span>
                        </div>
                    ))}
                </div>
            )
        }
    }
]