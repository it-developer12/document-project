"use client"

import { Control, UseFormReturn } from "react-hook-form"
import { CheckIcon, LoaderCircleIcon, X, XIcon } from "lucide-react"
import dayjs from "dayjs"
import { FieldPreview } from "@/app/component/FormRender"
import {
    Stepper,
    StepperDescription,
    StepperIndicator,
    StepperItem,
    StepperNav,
    StepperSeparator,
    StepperTitle,
    StepperTrigger,
} from "@/components/reui/stepper"

type TrackingStage = {
    stage: string
    status: string
    activity: any[]
    sub_stage?: any[]
}

type DetailDocument = any

export function PreviewModal({ fields, form, onClose }: { fields: FormField[]; form: UseFormReturn<any>; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose}>
            <div className="flex flex-col w-full max-w-7xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }} onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                    <span style={{ fontWeight: 600, color: "var(--foreground)" }}>ข้อมูลเอกสาร</span>
                    <button onClick={onClose} className="hover:cursor-pointer" style={{ color: "var(--muted-foreground)" }}><X size={16} /></button>
                </div>
                <div className="overflow-y-auto p-6 flex flex-col gap-5" style={{ scrollbarWidth: "none" }}>
                    {!fields?.length ? (
                        <p style={{ color: "var(--muted-foreground)", fontSize: "1rem", textAlign: "center" }}>ไม่พบข้อมูล</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {fields.map((field) => (
                                <div key={field.id} className="flex flex-col gap-1.5" style={{ gridColumn: field.width === "full" ? "1 / -1" : undefined }}>
                                    <label style={{ fontSize: "1rem", fontWeight: 500, color: "var(--foreground)" }}>
                                        {field.label}
                                        {field.required && <span style={{ color: "var(--destructive)", marginLeft: "0.25rem" }}>*</span>}
                                    </label>
                                    <FieldPreview field={field} control={form.control as Control} setValue={form.setValue} getValues={form.getValues} mode="view" />
                                    {field.helpText && <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{field.helpText}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export function WorkflowProgress({ stages, currentStage, separatorCount, onStageClick }: { stages: TrackingStage[]; currentStage: number; separatorCount: number; onStageClick: (stage: string) => void }) {
    return (
        <div className="mt-5 bg-white border rounded-xl px-5 py-4 shadow w-full">
            <span className="font-semibold text-xl">Workflow Progress</span>
            <div className="mt-10">
                <Stepper defaultValue={1} value={currentStage} indicators={{ completed: <CheckIcon className="size-3.5" />, loading: <LoaderCircleIcon className="size-3.5 animate-spin" /> }} className="w-full space-y-8">
                    <StepperNav>
                        {stages.map((stage, index) => {
                            const stepNumber = index + 1
                            const isCompleted = (stage.status === "COMPLETED" || stage.status === "COMPLETE") && currentStage >= index + 1
                            const isLoading = stage.status === "IN_PROCESS"
                            const isCancelled = stage.status === "CANCELLED"
                            const isRejected = stage.status === "REJECTED"
                            return (
                                <StepperItem key={stage.stage} step={stepNumber} completed={isCompleted} loading={isLoading} className="relative flex-1 items-start" onClick={() => onStageClick(stage.stage)}>
                                    <StepperTrigger className="flex flex-col gap-2.5">
                                        <StepperIndicator className="data-[state=completed]:bg-green-500 data-[state=completed]:text-white data-[state=inactive]:text-gray-500">
                                            {isCancelled || isRejected ? <XIcon className={isCancelled ? "bg-red-500 text-white" : "bg-black text-white"} /> : stepNumber}
                                        </StepperIndicator>
                                        <StepperTitle>{stage.stage}</StepperTitle>
                                        <StepperDescription>{stage.activity.at(-1)?.message ?? ""}</StepperDescription>
                                    </StepperTrigger>
                                    {separatorCount > index + 1 && <StepperSeparator className="group-data-[state=completed]/step:bg-green-500 absolute inset-x-0 top-2.5 left-[calc(50%+0.875rem)] m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem+0.225rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none" />}
                                </StepperItem>
                            )
                        })}
                    </StepperNav>
                </Stepper>
            </div>
        </div>
    )
}

export function ActivityHistory({ activities }: { activities: any[] }) {
    return (
        <div className="mt-5 bg-white border rounded-xl px-5 py-4 shadow w-full">
            <span className="font-bold text-xl">Activity History</span>
            <div className="flex items-center justify-start mt-4">
                <Stepper className="flex flex-col justify-center gap-10" value={activities.length} orientation="vertical">
                    <StepperNav>
                        {activities.map((step, index) => (
                            <StepperItem key={index} step={index + 1} className="relative items-start not-last:flex-1">
                                <StepperTrigger className="items-start gap-2.5 pb-8 px-1.5 mt-2 last:pb-0">
                                    <StepperIndicator className="data-[state=completed]:bg-[#4A4DF1] data-[state=active]:bg-[#4A4DF1] data-[state=inactive]:bg-[#4A4DF1] data-[state=completed]:text-white size-3">{""}</StepperIndicator>
                                    <div className="mt-0.5 text-left">
                                        <StepperTitle><span className="font-semibold">{step.message}</span>{" by " + step.createdBy.firstName}</StepperTitle>
                                        <StepperDescription>{step.message}</StepperDescription>
                                        <StepperDescription>{dayjs.utc(step.createdAt).tz("Asia/Bangkok").format("DD-MM-YYYY")}</StepperDescription>
                                    </div>
                                </StepperTrigger>
                                {index < activities.length - 1 && <StepperSeparator className="group-data-[state=completed]/step:bg-[#E2E5EF] group-data-[state=active]/step:bg-[#E2E5EF] group-data-[state=inactive]/step:bg-[#E2E5EF] absolute inset-y-0 top-7 left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=vertical]/stepper-nav:h-[calc(100%-2rem)]" />}
                            </StepperItem>
                        ))}
                    </StepperNav>
                </Stepper>
            </div>
        </div>
    )
}

export function DetailModal({ stage, stages, document: detailDocument, onClose }: { stage: string; stages: TrackingStage[]; document: DetailDocument; onClose: () => void }) {
    const modalDetail = stages.find((item) => item.stage === stage)
    
    if (!modalDetail) return null

    const approverRows = (modalDetail.sub_stage ?? []).map((step, index, rows) => {
        const startedAt = new Date(step.startedAt).getTime()
        const actedAt = new Date(step.actedAt).getTime()
        const previousActedAt = index === 0 ? new Date(detailDocument.createdAt).getTime() : new Date(rows[index - 1].actedAt).getTime()
        return { ...step, timeSpent: (actedAt - startedAt) / 86400000 < 1 ? -1 : Math.floor((actedAt - startedAt) / 86400000), timeDiff: (startedAt - previousActedAt) / 86400000 < 1 ? -1 : Math.floor((startedAt - previousActedAt) / 86400000) }
    })
    const processRows = (modalDetail.sub_stage ?? []).map((process, index, rows) => {
        const approvalSteps = detailDocument.workflowInstance?.executions?.[0]?.steps ?? []
        const previousTime = index === 0 ? new Date(approvalSteps.at(-1)?.actedAt).getTime() : new Date(rows[index - 1].createAt).getTime()
        return { ...process, diff: Math.floor((new Date(process.createAt).getTime() - previousTime) / 3600000) }
    })
    const statusText = (status: string, decision: string) => status === "PENDING" ? "รอการอนุมัติ" : status === "COMPLETED" && decision === "APPROVE" ? "อนุมัติแล้ว" : status === "COMPLETED" && decision === "CANCEL" ? "ยกเลิกเอกสาร" : status === "COMPLETED" && decision === "REJECT" ? "ตีกลับเอกสาร" : "ยังไม่ถึงขั้นตอน"
    const statusClass = (status: string, decision?: string) => status === "PENDING" ? "bg-[#4A4DF1] text-white" : status === "COMPLETED" && decision === "APPROVE" ? "bg-green-500 text-white" : status === "COMPLETED" && decision === "CANCEL" ? "bg-red-500 text-white" : status === "COMPLETED" && decision === "REJECT" ? "bg-black text-white" : "bg-[#e8e8e8]"
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose}>
            <div className="flex flex-col w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }} onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}><span style={{ fontWeight: 600, color: "var(--foreground)" }}>ขั้นตอน {stage}</span><button onClick={onClose} className="hover:cursor-pointer" style={{ color: "var(--muted-foreground)" }}><X size={16} /></button></div>
                <div className="overflow-y-auto p-6 flex flex-col gap-5" style={{ scrollbarWidth: "none" }}>
                    <div className="flex gap-2 flex-wrap"><span className="text-[#4A4DF1]">● กำลังรอการดำเนินการ</span><span className="text-gray-400">● ยังไม่ถึงขั้นตอนการดำเนินการ</span><span className="text-green-500">● ดำเนินการเรียบร้อยแล้ว</span><span className="text-black">● เอกสารตีกลับ</span><span className="text-red-500">● ยกเลิกเอกสาร</span></div>
                    <div className="space-y-2">
                        {stage === "approve" ?
                            approverRows.map((item, index) =>
                                <div key={index} className={`w-full p-3 flex justify-between rounded-2xl ${statusClass(item.status, item.decision)}`}>
                                    <span>{statusText(item.status, item.decision)} by {item.employee.firstName}</span>
                                    <span>{item.status === "PENDING"
                                        ?
                                        ""
                                        :
                                        item.timeSpent !== -1 && (item.status !== "WAITING")
                                            ?
                                            `${item.timeSpent} วัน`
                                            :
                                            item.timeSpent === -1 && (item.status !== "WAITING")
                                                ?
                                                "ใช้เวลาน้อยกว่า 1 วัน"
                                                :
                                                ""}</span>
                                </div>)
                            :
                            stage === "process"
                                ?
                                processRows.map((item, index) =>
                                    <div key={index} className="w-full bg-green-500 text-white p-3 flex justify-between rounded-2xl">
                                        <span>{item.description} by {item.processBy.firstName}</span>
                                        <span>{item.diff > 0
                                            ?
                                            `${item.diff} ชั่วโมง`
                                            :
                                            "น้อยกว่า 1 ชั่วโมง"}</span>
                                    </div>)
                                :
                                <div className="w-full bg-green-500 text-white p-3 flex justify-between rounded-2xl">
                                    <span>{modalDetail.activity[0]?.message} by {modalDetail.activity[0]?.createdBy?.firstName}</span>
                                </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}
