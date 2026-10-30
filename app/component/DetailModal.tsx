"use client"
import { Clock3, FileText, Send, X } from "lucide-react";
import { toast } from "react-toastify";
import { useRef, useEffect, useState } from "react";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc);
dayjs.extend(timezone);

interface DetailModalProps {
    onClose: () => void;
    detail: {
        open: boolean;
        document_id: string;
    };
    message: string;
    setMessage: (value: string) => void;
    docs: any[];
    activities: any[];
    processMutate: any;
    finishMutate: any;
    currentPage: string;
    requireProcessConfirmation?: boolean;
    requireFinishConfirmation?: boolean;
    showFinishAction?: boolean;
}

export function DetailModal({
    onClose,
    detail,
    message,
    setMessage,
    docs,
    activities,
    processMutate,
    finishMutate,
    currentPage,
    requireProcessConfirmation = false,
    requireFinishConfirmation = false,
    showFinishAction = true,
}: DetailModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isProcessConfirmationOpen, setIsProcessConfirmationOpen] = useState(false);
    const [isFinishConfirmationOpen, setIsFinishConfirmationOpen] = useState(false);
    
    useEffect(() => {
        if (detail.open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [detail.open]);
    const workflow = docs.find((doc) => doc.documentNo === detail.document_id)
        ?.workflowInstance?.workflowDefinitionVersion?.workflowStep ?? [];
    const type = workflow.map((step: any) => step.type);
    const activity = activities.find((act) => act.document_code === detail.document_id);
    const isProcessor = type.find((t:any) => t === "PROCESSOR")
    const isFinisher = type.find((t:any) => t === "FINISHER")
    function AddProcess() {
        if (!message.trim()) {
            toast.error("กรุณากรอกคำอธิบายการดำเนินการ");
            return;
        }

        if (requireProcessConfirmation) {
            setIsProcessConfirmationOpen(true);
            return;
        }

        SubmitProcess();
    }

    function SubmitProcess() {
        processMutate.mutate({
            document_code: detail.document_id,
            task_description: message,
        });
        setMessage("")
    }

    function FinishDocument(code: string) {
        finishMutate.mutate(code)
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="document-activity-title"
                className="flex w-full max-w-3xl max-h-[min(90vh,800px)] flex-col overflow-hidden rounded-2xl shadow-2xl"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6"
                    style={{ borderColor: "var(--border)" }}
                >
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs font-medium text-indigo-600">
                            <FileText size={15} aria-hidden="true" />
                            <span>เอกสาร</span>
                        </div>
                        <h2
                            id="document-activity-title"
                            className="mt-1 text-lg font-semibold text-slate-900"
                        >
                            ประวัติการดำเนินการ
                        </h2>
                        <p className="mt-1 break-all text-sm text-slate-500">
                            {detail.document_id}
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="ปิดหน้าต่าง"
                        onClick={onClose}
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div
                    className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6"
                >
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <h3 className="font-semibold text-slate-900">กิจกรรมล่าสุด</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                {activity?.activities.length
                                    ? `${activity.activities.length} รายการ`
                                    : "ติดตามความคืบหน้าของเอกสาร"}
                            </p>
                        </div>
                        <Clock3 size={18} className="shrink-0 text-slate-400" aria-hidden="true" />
                    </div>
                    {activity?.activities.length ? (
                        <ol className="space-y-3">
                            {activity.activities.map((act: any, index: number) => (
                                <li key={act.id ?? `${act.createdAt}-${index}`} className="relative pl-7">
                                    {index < activity.activities.length - 1 && (
                                        <span
                                            aria-hidden="true"
                                            className="absolute bottom-[-14px] left-[9px] top-5 w-px bg-slate-200"
                                        />
                                    )}
                                    <span
                                        aria-hidden="true"
                                        className="absolute left-0 top-1 flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-4 ring-white"
                                    >
                                        <span className="size-2 rounded-full bg-emerald-600" />
                                    </span>
                                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                                            <p className="whitespace-pre-wrap break-words text-sm font-medium leading-6 text-slate-800">
                                                {act.message}
                                            </p>
                                            <time
                                                dateTime={act.createdAt}
                                                className="shrink-0 text-xs text-slate-500"
                                            >
                                                {dayjs.utc(act.createdAt).tz("Asia/Bangkok").format("DD-MM-YYYY เวลา HH:mm")}
                                            </time>
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">
                                            ดำเนินการโดย {act.createdBy?.firstName ?? "ไม่ระบุ"}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                            <span className="flex size-11 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                                <Clock3 size={20} aria-hidden="true" />
                            </span>
                            <p className="mt-3 font-medium text-slate-700">ยังไม่มีประวัติการดำเนินการ</p>
                            <p className="mt-1 text-sm text-slate-500">
                                เมื่อมีการอัปเดต กิจกรรมจะแสดงที่นี่
                            </p>
                        </div>
                    )}
                </div>
                {(isProcessor && currentPage === "Process") || (isFinisher && currentPage === "Complete" && showFinishAction) ? (
                    <div className="border-t bg-slate-50/80 px-5 py-4 sm:px-6" style={{ borderColor: "var(--border)" }}>
                        <div className="mb-3">
                            <h3 className="font-semibold text-slate-900">การดำเนินการ</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                {isProcessor && currentPage === "Process"
                                    ? "เพิ่มบันทึกเพื่อแจ้งความคืบหน้าของเอกสาร"
                                    : "ยืนยันว่าเอกสารดำเนินการเสร็จสิ้นแล้ว"}
                            </p>
                        </div>
                        {isProcessor && currentPage === "Process" && (
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <input
                                    ref={inputRef}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !processMutate.isPending) {
                                            AddProcess();
                                        }
                                    }}
                                    type="text"
                                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                                    placeholder="เช่น ตรวจสอบเอกสารเรียบร้อยแล้ว"
                                    aria-label="คำอธิบายการดำเนินการ"
                                    disabled={processMutate.isPending}
                                />
                                <button
                                    type="button"
                                    disabled={processMutate.isPending || !message.trim()}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={AddProcess}
                                >
                                    <Send size={16} aria-hidden="true" />
                                    {processMutate.isPending ? "กำลังบันทึก..." : "เพิ่มบันทึก"}
                                </button>
                            </div>
                        )}
                        {isFinisher && currentPage === "Complete" && showFinishAction && (
                            <button
                                type="button"
                                disabled={finishMutate.isPending}
                                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => {
                                    if (requireFinishConfirmation) {
                                        setIsFinishConfirmationOpen(true);
                                        return;
                                    }

                                    FinishDocument(detail.document_id);
                                }}
                            >
                                {finishMutate.isPending ? "กำลังดำเนินการ..." : "ดำเนินการสำเร็จ"}
                            </button>
                        )}
                    </div>
                ) : null}
            </div>
            {isProcessConfirmationOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-6"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }}
                    onClick={(event) => {
                        event.stopPropagation();
                        setIsProcessConfirmationOpen(false);
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="process-confirmation-title"
                        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
                        style={{ background: "var(--card)", borderColor: "var(--border)" }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2 id="process-confirmation-title" className="text-lg font-semibold">
                            ยืนยันการบันทึกการดำเนินการ
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            ต้องการบันทึกคำอธิบายนี้ในเอกสาร {detail.document_id} หรือไม่?
                        </p>
                        <p className="mt-2 break-words rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                            {message.trim()}
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
                                style={{ borderColor: "var(--border)" }}
                                disabled={processMutate.isPending}
                                onClick={() => setIsProcessConfirmationOpen(false)}
                            >
                                กลับไปแก้ไข
                            </button>
                            <button
                                type="button"
                                className="rounded-lg bg-[#4A4DF1] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={processMutate.isPending}
                                onClick={() => {
                                    setIsProcessConfirmationOpen(false);
                                    SubmitProcess();
                                }}
                            >
                                {processMutate.isPending ? "กำลังบันทึก..." : "ยืนยันการส่ง"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isFinishConfirmationOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-6"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }}
                    onClick={(event) => {
                        event.stopPropagation();
                        setIsFinishConfirmationOpen(false);
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="finish-document-confirmation-title"
                        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
                        style={{ background: "var(--card)", borderColor: "var(--border)" }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h2 id="finish-document-confirmation-title" className="text-lg font-semibold">
                            ยืนยันการดำเนินการให้เสร็จสิ้น
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            เมื่อยืนยันแล้ว เอกสารจะถูกทำเครื่องหมายว่าเสร็จสิ้น คุณต้องการดำเนินการต่อหรือไม่?
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
                                style={{ borderColor: "var(--border)" }}
                                onClick={() => setIsFinishConfirmationOpen(false)}
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                className="rounded-lg bg-[#4A4DF1] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={finishMutate.isPending}
                                onClick={() => {
                                    setIsFinishConfirmationOpen(false);
                                    FinishDocument(detail.document_id);
                                }}
                            >
                                {finishMutate.isPending ? "กำลังดำเนินการ..." : "ยืนยัน"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
