"use client"

import { ColumnDef } from "@tanstack/react-table"
import { StatusBadge } from "./StatusBadge"
import { PriorityBadge } from "./PriorityBadge"
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc);
dayjs.extend(timezone);

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type DocumentColumn = {
    id: string;
    title: string;
    priority: "low" | "medium" | "high"
    company: string;
    owner: string;
    department: string;
    status: "WAITING_APPROVAL" | "PROCESSING" | "REJECTED" | "CANCELLED" | "COMPLETED";
    created: string;
    updated: string;
    end_date: string;
}
type Priority = "low" | "medium" | "high"
type Status = "WAITING_APPROVAL" | "PROCESSING" | "REJECTED" | "CANCELLED" | "COMPLETED";

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
                        onClick={() => setDetail({ open: true, document_id: row.original.id })}
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
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => <PriorityBadge status={row.original.priority as Priority} />
        },
        {
            accessorKey: "company",
            header: "Company",
            cell: ({ row }) => {
                var company_name = "";
                switch (row.original.company) {
                    case "ctx":
                        company_name = "Ctx holding"
                        break;
                    case "cff":
                        company_name = "Cityfresh Fruits"
                        break;
                    case "nbm":
                        company_name = "Noble marketing"
                        break;
                    default:
                        company_name = ""
                        break;
                }
                return (
                    <span>{company_name}</span>
                )
            }
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
        }
    ]