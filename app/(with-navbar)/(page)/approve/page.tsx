"use client"
import { columns } from "@/app/component/ApproveColumn";
import { DataTable } from "@/app/component/DocumentTable";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from '@iconify/react';
import { ArrowLeft, BrushCleaning } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Page() {
    interface TableState {
        status: boolean;
        text: string;
        department: string;
        company: string;
        document_list: {
            id: string;
            title: string;
            priority: Status;
            owner: string;
            department: string;
            company: string;
            status: DocStatus;
            created: string;
            updated: string;
            end_date: string;
        }[];
    }
    const company = [
        { label: "Cityfresh Fruit", value: "cff" },
        { label: "Ctx holding", value: "ctx" },
        { label: "Noble marketing", value: "nbm" },
    ]

    const department = [
        { label: "Innovation Technology", value: "it" },
        { label: "Finance", value: "finance" },
        { label: "B2C", value: "b2c" },
    ]
    type Status = "low" | "medium" | "high";
    type DocStatus = "Draft" | "Approved" | "Processing" | "Completed" | "Cancelled" | "Pending" | "Rejected";
    const documents: {
        id: string;
        title: string;
        priority: Status;
        owner: string;
        department: string;
        company: string;
        status: DocStatus;
        created: string;
        updated: string;
        end_date: string;
    }[] = [
            { id: "DOC-IT-002", title: "แบบฟอร์มการขอเข้าใช้งานระบบคอมพิวเตอร์", priority: "low", owner: "Jame", company: "cff", department: "IT", status: "Completed", created: "2024-10-30", updated: "2024-11-07", end_date: "2024-10-30" },
            { id: "DOC-IT-003", title: "แบบฟอร์มร้องขอดำเนินการด้าน IT", priority: "high", owner: "Brian", company: "cff", department: "IT", status: "Pending", created: "2024-10-30", updated: "2024-11-07", end_date: "2024-10-30" },
        ];

    const [DocumentTable, setDocumentTable] = useState<TableState>({
        status: false,
        text: "",
        department: "",
        company: "",
        document_list: []
    });

    function handleSearch(name: string) {
        const filtered = documents.filter(doc => {
            const matchesText = !DocumentTable.text || doc.title.toLowerCase().includes(DocumentTable.text.toLowerCase()) || doc.id.toLowerCase().includes(DocumentTable.text.toLowerCase());
            const matchesDepartment = !DocumentTable.department || doc.department.toLowerCase() === DocumentTable.department.toLowerCase();
            const matchesCompany = !DocumentTable.company || doc.company === DocumentTable.company;
            return matchesText && matchesDepartment && matchesCompany;
        });
        setDocumentTable(prev => ({ ...prev, document_list: filtered, status: true }));
    }

    return (
        <div className="bg-slate-50 min-h-screen h-full w-full p-6">
            <div className='flex items-center gap-4'>
                <Link href={'/document_list'} accessKey="it01">
                    <div className='text-white p-2 bg-[#1b1b1b] rounded-md flex justify-between items-center gap-1'>
                        <span className='text-lg'><ArrowLeft /></span>
                    </div>
                </Link>
                <div className="">
                    <h1 className="text-2xl font-bold">{"อนุมัติเอกสาร"}</h1>
                    <span>{"Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."}</span>
                </div>
            </div>

            <div className="flex flex-col rounded-xl border overflow-hidden mt-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                {/* Table toolbar */}
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                    <h2 style={{ color: "var(--foreground)" }}>{"เอกสารทั้งหมด"}</h2>
                    <div className="flex justify-end items-center gap-2 w-3/4">
                        {DocumentTable.status && (
                            <button className='border rounded p-1.5 flex items-center hover:cursor-pointer' onClick={() => setDocumentTable({
                                status: false,
                                text: "",
                                department: "",
                                company: "",
                                document_list: []
                            })}>
                                <BrushCleaning size={"20px"} />
                            </button>
                        )}
                        <div
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border w-1/4"
                            style={{ borderColor: "var(--border)", background: "var(--input-background)" }}
                        >
                            <Icon icon="tabler:search" className="text-[14px]" style={{ color: "var(--muted-foreground)" }} />
                            <input
                                placeholder="Search documents…"
                                className="bg-transparent outline-none w-48"
                                style={{ fontSize: "0.8rem", color: "var(--foreground)" }}
                                value={DocumentTable.text}
                                onChange={(e) => setDocumentTable(prev => ({ ...prev, text: e.target.value }))}
                            />
                        </div>

                        <div className='w-1/4 flex gap-10'>
                            <Select
                                items={department}
                                value={DocumentTable.department}
                                onValueChange={(seleted: any) => setDocumentTable(prev => ({ ...prev, department: seleted }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="แผนก" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {department.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='w-1/4 flex gap-10'>
                            <Select
                                items={company}
                                value={DocumentTable.company}
                                onValueChange={(seleted: any) => setDocumentTable(prev => ({ ...prev, company: seleted }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="บริษัท" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {company.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <button onClick={() => handleSearch("todo")} className='bg-[#4A4DF1] text-white px-2 py-1 rounded-md hover:cursor-pointer'>{"ค้นหา"}</button>
                        </div>
                    </div>
                </div>
                <div className=''>
                    <DataTable columns={columns} data={DocumentTable.status ? DocumentTable.document_list : documents} />
                </div>
            </div>
        </div>
    )
}