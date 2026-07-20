"use client"
import { columns } from "@/app/component/ApproveColumn";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from '@iconify/react';
import { ArrowLeft, BrushCleaning, X } from "lucide-react";
import Link from "next/link";
import docDetail from "@/SampleData/form_detail.json"
import TrackingData from "@/SampleData/tracking.json"
import { useState } from "react";
import { DataTable } from "@/app/component/DocumentTable";
import { ProcessColumns } from "@/app/component/ProcessColumns";
import { Workflow, WorkflowActivity } from "./process";
import dayjs from "dayjs";
import { toast } from "react-toastify";

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
            { id: "DOC-IT-001", title: "แบบฟอร์มเบิกทรัพย์สิน", priority: "high", owner: "Brian", company: "cff", department: "IT", status: "Processing", created: "2024-11-01", updated: "2024-11-08", end_date: "2024-11-08" },
            { id: "DOC-IT-004", title: "แบบฟอร์มร้องขอดำเนินการด้าน IT", priority: "high", owner: "Marry", company: "cff", department: "Finance", status: "Processing", created: "2024-10-30", updated: "2024-11-07", end_date: "2024-10-30" },
        ];

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
    const [detail, setDetail] = useState({
        open: false,
        document_id: ""
    });

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

    const getActivityTimeline = (workflow: Workflow) => {
        const activities = workflow.stages
            .flatMap(stage =>
                stage.activities.map(activity => ({
                    ...activity,
                    id: stage.id,
                    stageName: stage.name,
                }))
            )
            .sort((a, b) =>
                dayjs(a.datetime).valueOf() - dayjs(b.datetime).valueOf()
            );

        return activities.map((activity, index) => {
            const previous = activities[index - 1];

            return {
                ...activity,
                diff:
                    previous == null
                        ? null
                        : dayjs(activity.datetime).diff(dayjs(previous.datetime), "day"),
            };
        });
    };

    function DetailModal({ onClose }: { onClose: () => void }) {
        const tracking = TrackingData.find(track => track.document_id == detail.document_id);
        const activities = tracking ? getActivityTimeline(tracking.workflow as Workflow) : [];
        const process = activities.filter((acc: WorkflowActivity) => acc.id === "processing")
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-6"
                style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
                onClick={onClose}
            >
                <div
                    className="flex flex-col w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
                    style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                        <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{"ขั้นตอนการดำเนินการ"}</span>
                        <button onClick={onClose} className="hover:cursor-pointer" style={{ color: "var(--muted-foreground)" }}><X size={16} /></button>
                    </div>
                    <div className="overflow-y-auto p-6 flex flex-col gap-5" style={{ scrollbarWidth: "none" }}>
                        {process.map((act: any, index: number) => (
                            <div key={index}>
                                <div className="w-full bg-green-500 text-white p-3 flex justify-between rounded-2xl">
                                    <div className="flex justify-between w-full">
                                        <div>
                                            <span>{`${act.title} by ${act.performed_by.name}`}</span>
                                        </div>
                                        <div>
                                            <span>{`ใช้เวลา ${act.diff} วัน`}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div>
                            <div className="">
                                <div className="font-semibold">
                                    <span>{"การดำเนินการ"}</span>
                                </div>
                                <div className="space-y-2">
                                    <input type="text" className="w-full p-1.5 pl-2 py-2 border rounded bg-[#F3F4F8] text-sm" placeholder="การดำเนินการ" />
                                    <button className="bg-black text-white rounded py-2 w-full hover:cursor-pointer" onClick={() => {
                                        toast.success("อัพเดทสถานะสำเร็จ")
                                        setDetail({ open: false, document_id: "" })
                                    }}>{"เพิ่ม"}</button>
                                    <button className="bg-[#4A4DF1] text-white rounded py-2 w-full hover:cursor-pointer" onClick={() => {
                                        toast.success("อัพเดทสถานะสำเร็จ")
                                        setDetail({ open: false, document_id: "" })
                                    }}>{"ดำเนินการสำเร็จ"}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                    <h1 className="text-2xl font-bold">{"ดำเนินการเอกสาร"}</h1>
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
                    <DataTable columns={ProcessColumns(setDetail)} data={DocumentTable.status ? DocumentTable.document_list : documents} />
                </div>
            </div>

            {detail.open && <DetailModal onClose={() => setDetail({ open: false, document_id: "" })} />}
        </div>
    )
}