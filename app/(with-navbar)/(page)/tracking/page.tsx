"use client"
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Eye, FileText, LoaderCircle, Search, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PriorityBadge } from "@/app/component/PriorityBadge";
import { StatusBadge } from "@/app/component/StatusBadge";
import dayjs from "dayjs";
import { useGetTracking } from '@/hooks/set-tracking';
import { useTrackingStore } from '@/store/tracking.store';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone'
import { useSearchTracking } from '@/hooks/search-tracking';
import { useSearchTrackingDetail } from '@/hooks/search-tracking-detail';
import {
    ActivityHistory,
    DetailModal as TrackingDetailModal,
    PreviewModal as TrackingPreviewModal,
    WorkflowProgress,
} from './TrackingComponents';

dayjs.extend(utc);
dayjs.extend(timezone);

type TrackedDocumentStatus =
    | "WAITING_APPROVAL"
    | "PROCESSING"
    | "REJECTED"
    | "CANCELLED"
    | "COMPLETED"
    | "DRAFT";

function isTrackedDocumentStatus(status: string): status is TrackedDocumentStatus {
    return ["WAITING_APPROVAL", "PROCESSING", "REJECTED", "CANCELLED", "COMPLETED", "DRAFT"].includes(status);
}

export default function Page() {
    const trackingQuery = useGetTracking();
    const searchDetail = useSearchTrackingDetail();
    const searchDocument = useTrackingStore((state) => state.SearchDocument)
    const detailDocument = useTrackingStore((state) => state.SearchDocumentDetail)

    const {
        search: triggerSearch,
        isPending: isSearching,
        error: searchError,
    } = useSearchTracking();
    const [doc, setDoc] = useState(false);
    const [selectedForm, setSelectedForm] = useState<any>(null);
    const [mainStage, setMainStage] = useState<any[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [detailError, setDetailError] = useState("");
    const searchDoc = searchDocument;
    const lastestDoc = useTrackingStore((state) => state.LastestDocument)

    const [searchState, SetSearchState] = useState("");
    //doc status =  created | draft | approved | rejected | process | completed | cancelled
    const [preview, setPreview] = useState(false);
    const [detail, setDetail] = useState({
        open: false,
        stage: ""
    });
    const [commentState, setCommentState] = useState("");
    const form = useForm({
        defaultValues: {},
    });
    function search(keyword: string) {
        const target = keyword.trim();
        if (!target) return;
        setHasSearched(true);
        setDoc(false);
        setDetailError("");
        triggerSearch(target);
    }

    async function findDoc(documentId: string = searchState) {
        const word = documentId.trim();
        if (!word) return;
        setDoc(false);
        setDetailError("");
        SetSearchState(word);

        try {
            await searchDetail.searchAsync(word);
        } catch {
            setDetailError("ไม่สามารถโหลดข้อมูลเอกสารได้ กรุณาลองอีกครั้ง");
            return;
        }

        const dd = useTrackingStore.getState().SearchDocumentDetail.document as any;
        if (!dd) {
            setDetailError("ไม่พบข้อมูลเอกสาร");
            return;
        }
        const execution = dd.workflowInstance?.executions?.[0];
        const activity = [
            {
                stage: "submit",
                status: "COMPLETE",
                activity: (dd?.activities ?? []).filter((item: any) => (item.type ?? "").includes("SUBMIT"))
            },
            {
                stage: "approve",
                status: execution?.status === "REJECTED" ? "REJECTED" : execution?.status === "CANCELLED" ? "CANCELLED" : execution?.status === "RUNNING" ? "IN_PROCESS" : execution ? "COMPLETED" : "",
                activity: (dd?.activities ?? []).filter((item: any) => (item.type ?? "").includes("APPROVE")),
                sub_stage: execution?.steps ?? []
            },
            {
                stage: "process",
                status: dd?.status === "PROCESSING" ? "IN_PROCESS" : dd?.status === "COMPLETED" ? "COMPLETED" : "",
                activity: (dd?.activities ?? []).filter((item: any) => (item.type ?? "").includes("PROCESS")),
                sub_stage: dd?.processInstances?.[0]?.processInstanceTasks ?? []
            },
            {
                stage: "complete",
                status: dd?.status === "COMPLETED" ? "COMPLETE" : "",
                activity: (dd?.activities ?? []).filter((item: any) => (item.type ?? "").includes("COMPLETE")),
                sub_stage: []
            },
        ];

        setMainStage(activity)
        const comment = execution?.steps?.find((step: any) => step.decision === "REJECT" || step.decision === "CANCEL")?.comment ?? ""
        const snapshot = dd?.revisions?.[0]?.snapshot ?? '[]';
        let schema;
        let answer;
        try {
            schema = JSON.parse(snapshot);
            answer = JSON.parse(dd?.revisions?.[0]?.formData ?? '{}');
        } catch {
            setDetailError("ข้อมูลเอกสารไม่สมบูรณ์ จึงไม่สามารถแสดงรายละเอียดได้");
            return;
        }
        if (!Array.isArray(schema) || !answer || typeof answer !== "object") {
            setDetailError("ข้อมูลเอกสารไม่สมบูรณ์ จึงไม่สามารถแสดงรายละเอียดได้");
            return;
        }
        setSelectedForm(schema)
        setCommentState(comment)

        const employeeField = schema.find(
            (field: any) => field.type === "employee_detail"
        );

        const result = { ...answer };

        if (employeeField && employeeField.id in result) {
            result.employee_field = result[employeeField.id];
            delete result[employeeField.id];
        }

        const dataDeJSON = {
            fields: snapshot,
            answers: result,
        };

        form.reset(dataDeJSON.answers);
        setDoc(true);
    }

    function findCurrentStage(data: any) {
        let stage = 1;
        if (data.status === "WAITING_APPROVAL") {
            stage = 2
        } else if (data.status === "PROCESSING") {
            stage = 3
        } else if (data.status === "REJECTED" || data.status === "CANCELLED") {
            stage = data.workflowInstance?.executions?.[0]?.status === "REJECTED" || data.workflowInstance?.executions?.[0]?.status === "CANCELLED" ? 2 : 3
        } else if (data.status === "COMPLETED") {
            stage = 4
        }

        return stage;
    }

    function renderDocumentCard(item: any) {
        const document = item.document;
        const documentNo = document?.documentNo;

        return (
            <button
                key={documentNo}
                type="button"
                onClick={() => findDoc(documentNo)}
                className="group flex min-w-0 items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
                <span className="flex min-w-0 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <FileText size={19} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                        <span className="block truncate font-semibold text-slate-900">{documentNo}</span>
                        <span className="mt-1 block truncate text-sm text-slate-500">
                            {document?.formSchema?.name ?? "ไม่ระบุชื่อเอกสาร"}
                        </span>
                        <span className="mt-2 block text-xs text-slate-500">
                            ผู้สร้าง {document?.createdBy?.firstName ?? "ไม่ระบุ"}
                        </span>
                    </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                    <CalendarDays size={14} aria-hidden="true" />
                    {item.createdAt && dayjs(item.createdAt).isValid()
                        ? dayjs.utc(item.createdAt).tz("Asia/Bangkok").format("DD-MM-YYYY")
                        : "ไม่ระบุวันที่"}
                    <ArrowRight size={16} className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600" aria-hidden="true" />
                </span>
            </button>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                <header className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        aria-label="กลับไปหน้าหลัก"
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    >
                        <ArrowLeft size={18} aria-hidden="true" />
                    </Link>
                    <div>
                        <p className="text-sm font-medium text-indigo-600">Document workflow</p>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">ติดตามเอกสาร</h1>
                        <p className="mt-1 text-sm text-slate-600">ค้นหาและตรวจสอบสถานะเอกสารได้จากรหัสเอกสาร</p>
                    </div>
                </header>

                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <form
                        className="flex flex-col gap-3 sm:flex-row"
                        onSubmit={(event) => {
                            event.preventDefault();
                            search(searchState);
                        }}
                    >
                        <label className="relative min-w-0 flex-1">
                            <span className="sr-only">รหัสเอกสาร</span>
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                            <input
                                type="search"
                                className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                placeholder="กรอกรหัสเอกสาร เช่น DOC-IT-001"
                                value={searchState}
                                onChange={(event) => SetSearchState(event.target.value)}
                                aria-label="รหัสเอกสาร"
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={!searchState.trim() || isSearching}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSearching ? <LoaderCircle size={17} className="animate-spin" /> : <Search size={17} />}
                            {isSearching ? "กำลังค้นหา..." : "ค้นหาเอกสาร"}
                        </button>
                    </form>
                    <p className="mt-3 text-xs text-slate-500">คุณสามารถเลือกเอกสารจากรายการล่าสุดด้านล่างได้เช่นกัน</p>
                </section>

                {hasSearched && (
                    <section className="mt-6" aria-live="polite">
                        <div className="mb-3 flex items-end justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">ผลการค้นหา</h2>
                                {!isSearching && <p className="mt-1 text-sm text-slate-500">พบ {searchDoc.length} รายการ</p>}
                            </div>
                        </div>
                        {isSearching ? (
                            <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-600 shadow-sm">
                                <LoaderCircle size={18} className="animate-spin text-indigo-600" />
                                กำลังค้นหาเอกสาร...
                            </div>
                        ) : searchError ? (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
                                ค้นหาเอกสารไม่สำเร็จ กรุณาลองอีกครั้ง
                            </div>
                        ) : searchDoc.length ? (
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {searchDoc.map((item: any) => renderDocumentCard(item))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-9 text-center">
                                <FileText size={28} className="mx-auto text-slate-400" aria-hidden="true" />
                                <p className="mt-3 font-medium text-slate-800">ไม่พบเอกสารที่ตรงกับรหัสนี้</p>
                                <p className="mt-1 text-sm text-slate-500">ตรวจสอบรหัสเอกสารแล้วลองค้นหาอีกครั้ง</p>
                            </div>
                        )}
                    </section>
                )}

                <section className="mt-6">
                    <div className="mb-3 flex items-end justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">เอกสารที่แก้ไขล่าสุด</h2>
                            <p className="mt-1 text-sm text-slate-500">เลือกเอกสารเพื่อดูขั้นตอนและประวัติการดำเนินการ</p>
                        </div>
                    </div>
                    {trackingQuery.isLoading ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {[1, 2, 3].map((item) => (
                                <div key={item} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
                            ))}
                        </div>
                    ) : trackingQuery.isError ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            โหลดรายการเอกสารล่าสุดไม่สำเร็จ กรุณารีเฟรชหน้าแล้วลองอีกครั้ง
                        </div>
                    ) : lastestDoc.length ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {lastestDoc.map((item) => renderDocumentCard(item))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center text-sm text-slate-500">
                            ยังไม่มีรายการเอกสารล่าสุด
                        </div>
                    )}
                </section>

                {searchDetail.isPending && (
                    <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-600 shadow-sm" role="status">
                        <LoaderCircle size={18} className="animate-spin text-indigo-600" />
                        กำลังโหลดรายละเอียดเอกสาร...
                    </div>
                )}
                {detailError && (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
                        {detailError}
                    </div>
                )}

            {doc ? (
                <>
                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                <span>{detailDocument.document.formSchema.division?.name === "-"
                                    ? "เอกสารสำหรับทุกแผนก"
                                    : detailDocument.document.formSchema.division?.name ?? "ไม่ระบุฝ่าย/แผนก"}</span>
                                <ArrowRight size={15} aria-hidden="true" />
                                <span className="font-semibold text-indigo-700">{detailDocument.document.documentNo}</span>
                            </div>
                            <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                                {detailDocument.document.formSchema.name}
                            </h2>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                {isTrackedDocumentStatus(detailDocument.document.status) && (
                                    <StatusBadge status={detailDocument.document.status} />
                                )}
                                <PriorityBadge status={detailDocument.document.priority} />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setPreview(true)}
                            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        >
                            <Eye size={16} aria-hidden="true" />
                            ดูเอกสาร
                        </button>
                    </div>
                    <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                            <UserRound size={17} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500">เจ้าของเอกสาร</p>
                                <p className="mt-1 truncate text-sm font-medium text-slate-800">
                                    {detailDocument.document.createdBy?.firstName ?? "ไม่ระบุ"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                            <FileText size={17} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500">ฝ่าย/แผนก</p>
                                <p className="mt-1 truncate text-sm font-medium text-slate-800">
                                    {detailDocument.document.formSchema.division?.name === "-"
                                        ? "เอกสารสำหรับทุกแผนก"
                                        : detailDocument.document.formSchema.division?.name ?? "ไม่ระบุ"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                            <CalendarDays size={17} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                            <div>
                                <p className="text-xs text-slate-500">สร้างเมื่อ</p>
                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    {dayjs(detailDocument.document.createdAt).isValid()
                                        ? dayjs.utc(detailDocument.document.createdAt).tz("Asia/Bangkok").format("DD-MM-YYYY")
                                        : "ไม่ระบุ"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                            <CalendarDays size={17} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                            <div>
                                <p className="text-xs text-slate-500">วันที่สิ้นสุดเอกสาร</p>
                                <p className="mt-1 text-sm font-medium text-slate-800">
                                    {dayjs(detailDocument.document.dueDate).isValid()
                                        ? dayjs.utc(detailDocument.document.dueDate).tz("Asia/Bangkok").format("DD-MM-YYYY")
                                        : "ไม่ระบุ"}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
                    <WorkflowProgress
                        stages={mainStage}
                        currentStage={findCurrentStage(detailDocument.document)}
                        separatorCount={4}
                        onStageClick={(stage) => setDetail({ open: true, stage })}
                    />
                    {(detailDocument.document.status === "CANCELLED" || detailDocument.document.status === "REJECTED") && (
                        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                            <h3 className="font-semibold text-amber-900">เหตุผลที่ตีกลับหรือยกเลิกเอกสาร</h3>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-900">
                                {commentState || "ไม่มีคำอธิบายเพิ่มเติม"}
                            </p>
                        </div>
                    )}
                    <ActivityHistory activities={detailDocument.document.activities ?? []} />
                </>
            ) : (
                !searchDetail.isPending && !detailError && (
                    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                        <Search size={30} className="mx-auto text-slate-400" aria-hidden="true" />
                        <h2 className="mt-3 font-semibold text-slate-800">ค้นหาเอกสารเพื่อติดตามความคืบหน้า</h2>
                        <p className="mt-1 text-sm text-slate-500">กรอกรหัสเอกสารด้านบน หรือเลือกจากเอกสารล่าสุด</p>
                    </div>
                )
            )}

            {preview && <TrackingPreviewModal fields={selectedForm as FormField[]} form={form} onClose={() => setPreview(false)} />}
            {detail.open && <TrackingDetailModal stage={detail.stage} stages={mainStage} document={detailDocument} onClose={() => setDetail({ open: false, stage: "" })} />}
            </div>
        </main>
    )
}