"use client";

import { DataTable } from "@/app/component/DocumentTable";
import { DetailModal } from "@/app/component/DetailModal";
import { ProcessColumns } from "@/app/component/ProcessColumns";
import { useProcessMutation } from "@/hooks/add-process-document";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinishMutation } from "@/hooks/finish-document";
import { useCompanyList, useDivisionList } from "@/hooks/create-form";
import { useGetDocuments } from "@/hooks/set-document";
import { useDocumentStore } from "@/store/document.store";
import { Icon } from "@iconify/react";
import { ArrowLeft, BrushCleaning } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type DocumentStatus = "WAITING_APPROVAL" | "PROCESSING" | "REJECTED" | "CANCELLED" | "COMPLETED";
type Priority = "low" | "medium" | "high";

type TableDocument = {
    id: string;
    title: string;
    priority: Priority;
    owner: string;
    department: string;
    company: string;
    status: DocumentStatus;
    created: string;
    updated: string;
    end_date: string;
    type: string[];
    schema_id: string;
};

type TableState = {
    isFiltered: boolean;
    text: string;
    department: string;
    company: string;
};

const EMPTY_TABLE_STATE: TableState = {
    isFiltered: false,
    text: "",
    department: "",
    company: "",
};

export default function Page() {
    const { data: divisionList } = useDivisionList();
    const { data: companyList } = useCompanyList();
    const { isLoading, isError, refetch } = useGetDocuments();
    const allDocuments = useDocumentStore((state) => state.documents);
    const activities = useDocumentStore((state) => state.activitiyDocuments);
    const docs = allDocuments.filter((doc) => doc.workflowInstance.workflowDefinitionVersion.workflowStep.find((step) => step.type === "FINISHER") && doc.status === "PROCESSING");
    const [detail, setDetail] = useState({ open: false, document_id: "" });
    const [message, setMessage] = useState("");
    const processMutate = useProcessMutation(setDetail);
    const finishMutate = useFinishMutation(setDetail);
    console.log(docs)
    const processingDocuments: TableDocument[] = docs
        .map((doc) => ({
            id: doc.documentNo,
            title: doc.formSchema.name,
            priority: doc.priority as Priority,
            owner: doc.createdBy.firstName,
            department: doc.formSchema.division.name,
            company: doc.currentRevision.company.code,
            status: doc.status as DocumentStatus,
            created: doc.createdAt,
            updated: doc.activities[0]?.createdAt ?? "",
            end_date: doc.dueDate,
            type: doc.workflowInstance?.workflowDefinitionVersion?.workflowStep.map((step) => step.type) ?? [],
            schema_id: doc.formSchema.code,
        }));

    const departmentOptions = divisionList?.map((division) => ({
        label: division.name,
        value: division.name,
    })) ?? [];
    const companyOptions = companyList?.map((company) => ({
        label: company.name,
        value: company.code,
    })) ?? [];

    const [table, setTable] = useState<TableState>(EMPTY_TABLE_STATE);

    function handleSearch() {
        setTable((previous) => ({ ...previous, isFiltered: true }));
    }

    const visibleDocuments = table.isFiltered
        ? processingDocuments.filter((document) => {
            const searchText = table.text.trim().toLowerCase();
            const matchesText =
                !searchText ||
                document.title.toLowerCase().includes(searchText) ||
                document.id.toLowerCase().includes(searchText);
            const matchesDepartment =
                !table.department ||
                document.department.toLowerCase() === table.department.toLowerCase();
            const matchesCompany = !table.company || document.company === table.company;

            return matchesText && matchesDepartment && matchesCompany;
        })
        : processingDocuments;

    return (
        <div className="min-h-screen h-full w-full bg-slate-50 p-4 sm:p-6">
            <div className="flex items-center gap-4">
                <Link href="/document_list" aria-label="กลับไปหน้ารายการเอกสาร">
                    <div className="flex items-center gap-1 rounded-md bg-[#1b1b1b] p-2 text-white">
                        <ArrowLeft className="text-lg" />
                    </div>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">เอกสารที่อนุมัติแล้วและกำลังดำเนินการ</h1>
                    <span>เอกสารที่มีสถานะกำลังดำเนินการ</span>
                </div>
            </div>

            <div className="mt-6 flex flex-col overflow-hidden rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="flex flex-col gap-3 border-b px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: "var(--border)" }}>
                    <h2 style={{ color: "var(--foreground)" }}>เอกสารทั้งหมด ({processingDocuments.length})</h2>
                    <div className={`grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-3/4 ${table.isFiltered ? "lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"}`}>
                        {table.isFiltered && (
                            <button
                                aria-label="ล้างตัวกรอง"
                                className="flex items-center justify-center rounded border p-1.5 hover:cursor-pointer"
                                onClick={() => setTable(EMPTY_TABLE_STATE)}
                            >
                                <BrushCleaning size={20} />
                            </button>
                        )}
                        <div className="flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--input-background)" }}>
                            <Icon icon="tabler:search" className="text-[14px]" style={{ color: "var(--muted-foreground)" }} />
                            <input
                                aria-label="ค้นหาเอกสาร"
                                placeholder="ค้นหาเอกสาร..."
                                className="w-full min-w-0 bg-transparent outline-none"
                                style={{ fontSize: "0.8rem", color: "var(--foreground)" }}
                                value={table.text}
                                onChange={(event) => setTable((previous) => ({ ...previous, text: event.target.value }))}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") handleSearch();
                                }}
                            />
                        </div>
                        <div className="min-w-0">
                            <Select
                                items={departmentOptions}
                                value={table.department}
                                onValueChange={(value) => setTable((previous) => ({ ...previous, department: value ?? "" }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="แผนก" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {departmentOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="min-w-0">
                            <Select
                                items={companyOptions}
                                value={table.company}
                                onValueChange={(value) => setTable((previous) => ({ ...previous, company: value ?? "" }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="บริษัท" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {companyOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <button
                            onClick={handleSearch}
                            type="button"
                            className="h-10 w-full rounded-md bg-[#4A4DF1] px-4 text-sm font-medium text-white hover:cursor-pointer hover:bg-indigo-700 lg:w-auto"
                        >
                            ค้นหา
                        </button>
                    </div>
                </div>
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
                        emptyMessage={table.isFiltered ? "ไม่พบเอกสารที่ตรงกับตัวกรอง" : "ไม่พบเอกสารที่กำลังดำเนินการ"}
                        previousPageLabel="ก่อนหน้า"
                        nextPageLabel="ถัดไป"
                    />
                )}
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
                    docs={allDocuments}
                    activities={activities}
                    processMutate={processMutate}
                    finishMutate={finishMutate}
                    currentPage={"Complete"}
                    requireFinishConfirmation
                />
            )}
        </div>
    );
}