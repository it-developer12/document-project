"use client"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from '@iconify/react';
import { ArrowLeft, BrushCleaning } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DataTable } from "@/app/component/DocumentTable";
import { ProcessColumns } from "@/app/component/ProcessColumns";
import { DetailModal } from "@/app/component/DetailModal";
import { useDocumentStore } from "@/store/document.store";
import { useGetDocuments } from "@/hooks/set-document";
import { useProcessMutation } from "@/hooks/add-process-document";
import { useFinishMutation } from "@/hooks/finish-document";
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
    }
    interface TableState {
        status: boolean;
        text: string;
        department: string;
        company: string;
    }

    const [detail, setDetail] = useState({
        open: false,
        document_id: "",
    });

    const [message, setMessage] = useState("")

    const { isLoading, isError, refetch } = useGetDocuments();
    const processMutate = useProcessMutation(setDetail);
    const finishMutate = useFinishMutation(setDetail);
    const docs = useDocumentStore((state) => state.processDocuments);
    const activities = useDocumentStore((state) => state.activitiyDocuments)
    
    const DOCUMENT: TableDoc[] = docs.map((doc) => ({
        id: doc.documentNo,
        title: doc.formSchema.name,
        priority: doc.priority as Status,
        owner: doc.createdBy.firstName,
        company: doc.currentRevision.company.code,
        department: doc.formSchema.division.name,
        status: doc.status as DocStatus,
        created: doc.createdAt,
        end_date: doc.dueDate,
        updated: doc.activities[0]?.createdAt ?? "",
        type: doc.workflowInstance?.workflowDefinitionVersion?.workflowStep[0]?.type
    }))

    const DEPARTMENT_OPTIONS = divisionList?.map((d: any) => ({ label: d.name, value: d.name })) ?? [];
    const COMPANY_OPTIONS = companyList?.map((c: any) => ({ label: c.name, value: c.code })) ?? [];

    const [DocumentTable, setDocumentTable] = useState<TableState>({
        status: false,
        text: "",
        department: "",
        company: "",
    });

    function handleSearch() {
        setDocumentTable((previous) => ({ ...previous, status: true }));
    }

    const visibleDocuments = DocumentTable.status
        ? DOCUMENT.filter((doc) => {
            const searchText = DocumentTable.text.trim().toLowerCase();
            const matchesText =
                !searchText ||
                doc.title.toLowerCase().includes(searchText) ||
                doc.id.toLowerCase().includes(searchText);
            const matchesDepartment =
                !DocumentTable.department ||
                doc.department.toLowerCase() === DocumentTable.department.toLowerCase();
            const matchesCompany = !DocumentTable.company || doc.company === DocumentTable.company;

            return matchesText && matchesDepartment && matchesCompany;
        })
        : DOCUMENT;

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
        <div className="bg-slate-50 min-h-screen h-full w-full p-4 sm:p-6">
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
                <Link href={'/document_list'} accessKey="it01">
                    <div className='text-white p-2 bg-[#1b1b1b] rounded-md flex justify-between items-center gap-1'>
                        <span className='text-lg'><ArrowLeft /></span>
                    </div>
                </Link>
                <div className="">
                    <h1 className="text-2xl font-bold">{"ดำเนินการเอกสาร"}</h1>
                    <span>{"ดำเนินการตามที่เอกสารร้องขอ"}</span>
                </div>
            </div>

            <div className="flex flex-col rounded-xl border overflow-hidden mt-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                {/* Table toolbar */}
                <div className="flex flex-col gap-3 border-b px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: "var(--border)" }}>
                    <h2 style={{ color: "var(--foreground)" }}>เอกสารทั้งหมด ({DOCUMENT.length})</h2>
                    <div className={`grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-3/4 ${DocumentTable.status ? "lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"}`}>
                        {DocumentTable.status && (
                            <button aria-label="ล้างตัวกรอง" className='flex items-center justify-center rounded border p-1.5 hover:cursor-pointer' onClick={() => setDocumentTable({
                                status: false,
                                text: "",
                                department: "",
                                company: "",
                            })}>
                                <BrushCleaning size={"20px"} />
                            </button>
                        )}
                        <div
                            className="flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2"
                            style={{ borderColor: "var(--border)", background: "var(--input-background)" }}
                        >
                            <Icon icon="tabler:search" className="text-[14px]" style={{ color: "var(--muted-foreground)" }} />
                            <input
                                aria-label="ค้นหาเอกสาร"
                                placeholder="ค้นหาเอกสาร..."
                                className="w-full min-w-0 bg-transparent outline-none"
                                style={{ fontSize: "0.8rem", color: "var(--foreground)" }}
                                value={DocumentTable.text}
                                onChange={(e) => setDocumentTable(prev => ({ ...prev, text: e.target.value }))}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") handleSearch();
                                }}
                            />
                        </div>

                        <div className="min-w-0">
                            <Select
                                items={DEPARTMENT_OPTIONS}
                                value={DocumentTable.department}
                                onValueChange={(selected: string | null) => setDocumentTable(prev => ({ ...prev, department: selected ?? "" }))}
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

                        <div className="min-w-0">
                            <Select
                                items={COMPANY_OPTIONS}
                                value={DocumentTable.company}
                                onValueChange={(selected: string | null) => setDocumentTable(prev => ({ ...prev, company: selected ?? "" }))}
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
                            <button type="button" onClick={handleSearch} className="h-10 w-full rounded-md bg-[#4A4DF1] px-4 text-sm font-medium text-white hover:cursor-pointer hover:bg-indigo-700 lg:w-auto">ค้นหา</button>
                        </div>
                    </div>
                </div>
                <div className=''>
                    {isLoading ? (
                        <div className="p-6 text-center" role="status">กำลังโหลดเอกสาร...</div>
                    ) : isError ? (
                        <div className="flex flex-col items-center gap-3 p-6 text-center" role="alert">
                            <p>ไม่สามารถโหลดเอกสารได้</p>
                            <button type="button" onClick={() => refetch()} className="rounded-md bg-[#4A4DF1] px-4 py-2 text-sm font-medium text-white">ลองอีกครั้ง</button>
                        </div>
                    ) : (
                        <DataTable
                            columns={ProcessColumns(setDetail)}
                            data={visibleDocuments}
                            emptyMessage={DocumentTable.status ? "ไม่พบเอกสารที่ตรงกับตัวกรอง" : "ไม่พบเอกสารที่กำลังดำเนินการ"}
                            previousPageLabel="ก่อนหน้า"
                            nextPageLabel="ถัดไป"
                        />
                    )}
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
                    currentPage={"Process"}
                    requireProcessConfirmation
                    showFinishAction={false}
                />
            )}
        </div>
    )
}