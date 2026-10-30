"use client"

import { ColumnDef } from "@tanstack/react-table"
import { StatusBadge } from "./StatusBadge"
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
    id: string;
    title: string;
    priority: "low" | "medium" | "high"
    company: string;
    owner: string;
    department: string;
    status: "WAITING_APPROVAL" | "PROCESSING" | "REJECTED" | "CANCELLED" | "COMPLETED";
    created: string;
    updated: string;
    end_date: string
    schema_id: string;
}
type Priority = "low" | "medium" | "high"
type Status = "WAITING_APPROVAL" | "PROCESSING" | "REJECTED" | "CANCELLED" | "COMPLETED";

export const columns: ColumnDef<DocumentColumn>[] = [
    {
        accessorKey: "id",
        header: "เลขที่เอกสาร",
        cell: ({ row }) => {
            return (
                <Link href={`/document_list/it/form?schema_id=${row.original.schema_id}&doc_id=${row.original.id}&mode=approve`}>
                    <span style={{ color: "#4A4DF1" }}>{row.original.id}</span>
                </Link>
            )
        }
    },
    {
        accessorKey: "title",
        header: "ชื่อเอกสาร",
    },
    {
        accessorKey: "priority",
        header: "ระดับความสำคัญ",
        cell: ({ row }) => <PriorityBadge status={row.original.priority as Priority} />
    },
    {
        accessorKey: "company",
        header: "บริษัท",
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
        header: "ผู้สร้างเอกสาร",
    },
    {
        accessorKey: "department",
        header: "เอกสารของแผนก",
        cell: ({ row }) => <span>{`${row.original.department === "-" ? "เอกสารสำหรับทุกแผนก" : row.original.department}`}</span>
    },
    {
        accessorKey: "status",
        header: "สถานะ",
        cell: ({ row }) => <StatusBadge status={row.original.status as Status} />
    },
    {
        accessorKey: "created",
        header: "วันที่สร้างเอกสาร",
        cell: ({ row }) => {
            const date = dayjs.utc(row.original.created).tz("Asia/Bangkok");
            const stringDate = date.isValid() ? date.format("DD-MM-YYYY") : "-";
            return (
                <span>{stringDate}</span>
            )
        }
    },
    {
        accessorKey: "updated",
        header: "แก้ไขล่าสุด",
        cell: ({ row }) => {
            const date = dayjs.utc(row.original.updated).tz("Asia/Bangkok");
            const stringDate = date.isValid() ? date.format("DD-MM-YYYY") : "-";
            return (
                <span>{stringDate}</span>
            )
        }
    },
    {
        accessorKey: "end_date",
        header: "วันที่สิ้นสุดเอกสาร",
        cell: ({ row }) => {
            const date = dayjs.utc(row.original.end_date).tz("Asia/Bangkok");
            const stringDate = date.isValid() ? date.format("DD-MM-YYYY") : "-";
            return (
                <span>{stringDate}</span>
            )
        }
    }
]