"use client"
import { columns } from "@/app/component/ApproveColumn";
import { DataTable } from "@/app/component/DocumentTable";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocumentStore } from "@/store/document.store";
import { useGetDocuments } from "@/hooks/set-document";
import { Icon } from '@iconify/react';
import { ArrowLeft, BrushCleaning } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCompanyList, useDivisionList } from "@/hooks/create-form";

export default function Page() {
    const { data: divisionList } = useDivisionList();
    const { data: companyList } = useCompanyList();
    type DocStatus = "WAITING_APPROVAL" | "PROCESSING" | "REJECTED" | "CANCELLED" | "COMPLETED";
    type Status = "low" | "medium" | "high";
    type TableDoc = {
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
        type: string;
        schema_id: string;
    }
    interface TableState {
        status: boolean;
        text: string;
        department: string;
        company: string;
        document_list: TableDoc[];
    }
    const COMPANY_OPTIONS = companyList?.map((c: any) => ({ label: c.name, value: c.code })) ?? [];

    const DEPARTMENT_OPTIONS = divisionList?.map((d: any) => ({ label: d.name, value: d.code })) ?? [];

    const docs = useDocumentStore((state) => state.approveDocuments);
    const { isLoading } = useGetDocuments();
    // console.log(docs)
    const DOCUMENT: TableDoc[] = docs.map((doc) => ({
        id: doc.documentNo,
        title: doc.formSchema.name,
        priority: doc.priority as Status,
        owner: doc.createdBy.firstName,
        company: doc.formSchema.company.name,
        department: doc.formSchema.division.name,
        status: doc.status as DocStatus,
        created: doc.createdAt,
        end_date: doc.dueDate,
        updated: doc.activities[0].createdAt,
        type: doc.workflowInstance.executions[0]?.steps[0]?.type,
        schema_id: doc.formSchema.code
    }))

    const [DocumentTable, setDocumentTable] = useState<TableState>({
        status: false,
        text: "",
        department: "",
        company: "",
        document_list: []
    });

    function handleSearch(name: string) {
        const filtered = DOCUMENT.filter(doc => {
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
                                items={DEPARTMENT_OPTIONS}
                                value={DocumentTable.department}
                                onValueChange={(seleted: any) => setDocumentTable(prev => ({ ...prev, department: seleted }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="แผนก" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {DEPARTMENT_OPTIONS.map((item: any) => (
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
                                items={COMPANY_OPTIONS}
                                value={DocumentTable.company}
                                onValueChange={(seleted: any) => setDocumentTable(prev => ({ ...prev, company: seleted }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="บริษัท" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {COMPANY_OPTIONS.map((item: any) => (
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
                    {isLoading ? (
                        <div className="p-6 text-center">กำลังโหลดเอกสาร...</div>
                    ) : (
                        <DataTable columns={columns} data={DocumentTable.status ? DocumentTable.document_list : DOCUMENT} />
                    )}
                </div>
            </div>
        </div>
    )
}