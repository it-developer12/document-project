"use client"
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useRef, useEffect } from "react";
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
}

export function DetailModal({
    onClose,
    detail,
    message,
    setMessage,
    docs,
    activities,
    processMutate,
    finishMutate
}: DetailModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        if (detail.open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [detail.open]);

    const type = docs.find((doc) => doc.documentNo === detail.document_id)
        ?.workflowInstance.workflowDefinitionVersion.workflowStep[0].type;
    const activity = activities.find((act) => act.document_code === detail.document_id);

    function AddProcess() {
        if (!message.trim()) {
            toast.error("กรุณากรอกคำอธิบายการดำเนินการ");
            return;
        }
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
                className="flex flex-col w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="flex items-center justify-between px-6 py-4 border-b"
                    style={{ borderColor: "var(--border)" }}
                >
                    <span style={{ fontWeight: 600, color: "var(--foreground)" }}>
                        {"ขั้นตอนการดำเนินการ"}
                    </span>
                    <button
                        onClick={onClose}
                        className="hover:cursor-pointer"
                        style={{ color: "var(--muted-foreground)" }}
                    >
                        <X size={16} />
                    </button>
                </div>
                <div
                    className="overflow-y-auto p-6 flex flex-col gap-5"
                    style={{ scrollbarWidth: "none" }}
                >
                    {activity?.activities.map((act: any, index: number) => (
                        <div key={index}>
                            <div className="w-full bg-green-500 text-white p-3 flex justify-between rounded-2xl">
                                <div className="flex justify-between w-full">
                                    <div>
                                        <span>{`${act.message} by ${act.createdBy.firstName}`}</span>
                                    </div>
                                    <div>
                                        <span>{`${dayjs.utc(act.createdAt).tz("Asia/Bangkok").format("DD-MM-YYYY")}`}</span>
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
                                {type === "PROCESSOR" ? (
                                    <div className="space-y-2">
                                        <input
                                            ref={inputRef}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    AddProcess();
                                                }
                                            }}
                                            type="text"
                                            className="w-full p-1.5 pl-2 py-2 border rounded bg-[#F3F4F8] text-sm"
                                            placeholder="การดำเนินการ"
                                        />
                                        <button
                                            className="bg-black text-white rounded py-2 w-full hover:cursor-pointer hover:bg-gray-800 transition"
                                            onClick={AddProcess}
                                        >
                                            {"เพิ่ม"}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className="bg-[#4A4DF1] text-white rounded py-2 w-full hover:cursor-pointer hover:bg-blue-700 transition"
                                        onClick={() => FinishDocument(detail.document_id)}
                                    >
                                        {"ดำเนินการสำเร็จ"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
