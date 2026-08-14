"use client"
import { columns } from "@/app/component/ApproveColumn";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from '@iconify/react';
import { ArrowLeft, BrushCleaning } from "lucide-react";
import Link from "next/link";
import docDetail from "@/SampleData/form_detail.json"
import TrackingData from "@/SampleData/tracking.json"
import { useEffect, useState } from "react";
import { DataTable } from "@/app/component/DocumentTable";
import { ProcessColumns } from "@/app/component/ProcessColumns";
import { DetailModal } from "@/app/component/DetailModal";
import { Workflow, WorkflowActivity } from "./process";
import dayjs from "dayjs";
import { useDocumentStore } from "@/store/document.store";
import { useGetDocuments } from "@/hooks/set-document";
import { processMutation } from "@/hooks/add-process-document";
import { finishMutation } from "@/hooks/finish-document";

const COMPANY = [
    { label: "Cityfresh Fruit", value: "cff" },
    { label: "Ctx holding", value: "ctx" },
    { label: "Noble marketing", value: "nbm" },
]

export default function Page() {
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
    }
    interface TableState {
        status: boolean;
        text: string;
        department: string;
        company: string;
        document_list: TableDoc[];
    }

    const [detail, setDetail] = useState({
        open: false,
        document_id: "",
    });

    const [message, setMessage] = useState("")

    const { isLoading } = useGetDocuments();
    const processMutate = processMutation(setDetail);
    const finishMutate = finishMutation(setDetail);
    const docs = useDocumentStore((state) => state.processDocuments);
    const activities = useDocumentStore((state) => state.activitiyDocuments)

    const DOCUMENT: TableDoc[] = docs.map((doc) => ({
        id: doc.documentNo,
        title: doc.formSchema.name,
        priority: "high",
        owner: doc.createdBy.firstName,
        company: doc.formSchema.company.name,
        department: doc.formSchema.division.name,
        status: doc.status as DocStatus,
        created: doc.createdAt,
        end_date: doc.dueDate,
        updated: doc.activities[0].createdAt,
        type: doc.workflowInstance.workflowDefinition.versions[0].workflowStep[0].type
    }))

    const department = [
        { label: "Innovation Technology", value: "it" },
        { label: "Finance", value: "finance" },
        { label: "B2C", value: "b2c" },
    ]

    const [DocumentTable, setDocumentTable] = useState<TableState>({
        status: false,
        text: "",
        department: "",
        company: "",
        document_list: []
    });

    function handleSearch() {
        const filtered = DOCUMENT.filter(doc => {
            const matchesText = !DocumentTable.text || doc.title.toLowerCase().includes(DocumentTable.text.toLowerCase()) || doc.id.toLowerCase().includes(DocumentTable.text.toLowerCase());
            const matchesDepartment = !DocumentTable.department || doc.department.toLowerCase() === DocumentTable.department.toLowerCase();
            const matchesCompany = !DocumentTable.company || doc.company === DocumentTable.company;
            return matchesText && matchesDepartment && matchesCompany;
        });
        setDocumentTable(prev => ({ ...prev, document_list: filtered, status: true }));
    }

    // const getActivityTimeline = (workflow: Workflow) => {
    //     const activities = workflow.stages
    //         .flatMap(stage =>
    //             stage.activities.map(activity => ({
    //                 ...activity,
    //                 id: stage.id,
    //                 stageName: stage.name,
    //             }))
    //         )
    //         .sort((a, b) =>
    //             dayjs(a.datetime).valueOf() - dayjs(b.datetime).valueOf()
    //         );

    //     return activities.map((activity, index) => {
    //         const previous = activities[index - 1];

    //         return {
    //             ...activity,
    //             diff:
    //                 previous == null
    //                     ? null
    //                     : dayjs(activity.datetime).diff(dayjs(previous.datetime), "day"),
    //         };
    //     });
    // };


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
                                items={COMPANY}
                                value={DocumentTable.company}
                                onValueChange={(seleted: any) => setDocumentTable(prev => ({ ...prev, company: seleted }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="บริษัท" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {COMPANY.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <button onClick={() => handleSearch()} className='bg-[#4A4DF1] text-white px-2 py-1 rounded-md hover:cursor-pointer'>{"ค้นหา"}</button>
                        </div>
                    </div>
                </div>
                <div className=''>
                    <DataTable columns={ProcessColumns(setDetail)} data={DocumentTable.status ? DocumentTable.document_list : DOCUMENT} />
                </div>
            </div>

            {detail.open && (
                <DetailModal
                    onClose={() => {
                        setDetail({ open: false, document_id: "" });
                        setMessage("");
                    }}
                    detail={detail}
                    message={message}
                    setMessage={setMessage}
                    docs={docs}
                    activities={activities}
                    processMutate={processMutate}
                    finishMutate={finishMutate}
                />
            )}
        </div>
    )
}