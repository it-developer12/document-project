"use client"
import { Icon } from '@iconify/react';
import Link from "next/link";
import {
    Stepper,
    StepperContent,
    StepperDescription,
    StepperIndicator,
    StepperItem,
    StepperNav,
    StepperPanel,
    StepperSeparator,
    StepperTitle,
    StepperTrigger,
} from "@/components/reui/stepper"

import { CheckIcon, ChevronUp, Eye, FileImage, Hash, LoaderCircleIcon, PlusCircle, Search, UploadCloud, X, XIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from "react";
import TrackingData from "@/SampleData/tracking.json"
import FormSchema from "@/SampleData/form.json"
import FormDetail from "@/SampleData/form_detail.json"
import { Control, Controller, useForm } from "react-hook-form";
import { FieldPreview } from "@/app/component/FormRender";
import { PriorityBadge } from "@/app/component/PriorityBadge";
import { DocumentTracking, DocumentTrackingRecord, Workflow, WorkflowActivity } from "./tracking";
import dayjs from "dayjs";
import { differenceInDays } from "date-fns";

export default function Page() {
    const steps = [
        { title: "Created", description: "สร้างเอกสาร", value: "created" },
        { title: "Approve", description: "ตรวจสอบและอนุญาติ", value: "approve" },
        { title: "Processing", description: "ดำเนินการ", value: "processing" },
        { title: "Complete", description: "ตรวจสอบและจัดเก็บ", value: "complete" },
    ]
    const last = [
        { document_id: "DOC-IT-001", title: "แบบฟอร์มเบิกทรัพย์สิน", owner: "Jame", updated_at: "2024-12-30" },
        { document_id: "DOC-IT-002", title: "แบบฟอร์มการขอเข้าใช้งานระบบคอมพิวเตอร์", owner: "Marcus", updated_at: "2024-12-30" },
        { document_id: "DOC-IT-003", title: "แบบฟอร์มเบิกทรัพย์สิน", owner: "Susan", updated_at: "2024-12-30" },
        { document_id: "DOC-IT-004", title: "แบบฟอร์มร้องขอดำเนินการด้าน IT", owner: "Finn", updated_at: "2024-12-30" },
        { document_id: "DOC-IT-005", title: "แบบฟอร์มการขอเข้าใช้งานระบบคอมพิวเตอร์", owner: "Marry", updated_at: "2024-12-30" },
        { document_id: "DOC-IT-006", title: "แบบฟอร์มเบิกทรัพย์สิน", owner: "Diana", updated_at: "2024-12-30" },
        { document_id: "DOC-IT-007", title: "แบบฟอร์มการขอเข้าใช้งานระบบคอมพิวเตอร์", owner: "Annie", updated_at: "2024-12-30" },
        { document_id: "DOC-IT-008", title: "แบบฟอร์มร้องขอดำเนินการด้าน IT", owner: "Brian", updated_at: "2024-12-30" },
        { document_id: "DOC-IT-009", title: "แบบฟอร์มร้องขอดำเนินการด้าน IT", owner: "Frank", updated_at: "2024-12-30" },
        { document_id: "DOC-IT-010", title: "แบบฟอร์มเบิกทรัพย์สิน", owner: "Gorge", updated_at: "2024-12-30" },
    ]

    const [searchState, SetSearchState] = useState("");
    //doc status =  created | draft | approved | rejected | process | completed | cancelled
    const [preview, setPreview] = useState(false);
    const [detail, setDetail] = useState({
        open: false,
        stage: ""
    });
    const [doc, setDoc] = useState(false);
    const [selectedForm, setSelectedForm] = useState<any>(null);
    const [mainStage, setMainStage] = useState<any>({});
    const [subStage, setSubStage] = useState<any>([]);
    const [docDetail, setDocDetail] = useState<any>([]);
    const [TrackingDataState, setTrackingDataState] = useState<DocumentTracking>({
        document_id: "",
        schema_id: "",
        title: "",
        department: "",
        type: "",
        priority: "low",
        workflow: {
            status: "in_progress",
            current_stage: "created",
            stages: [
                {
                    id: "created",
                    name: "Created",
                    status: "completed",
                    started_at: "2025-11-04",
                    completed_at: "2025-11-04",
                    activities: []
                },
                {
                    id: "approve",
                    name: "Approve",
                    status: "pending",
                    started_at: "",
                    completed_at: "",
                    activities: []
                },
                {
                    id: "processing",
                    name: "Created",
                    status: "pending",
                    started_at: "",
                    completed_at: "",
                    activities: []
                },
                {
                    id: "complete",
                    name: "Complete",
                    status: "pending",
                    started_at: "",
                    completed_at: "",
                    activities: []
                }

            ]
        },
        "created_by": {
            id: "",
            name: ""
        },
        "updated_at": "",
        "due_date": "",
        "note": ""
    });
    const mode = "view";

    const form = useForm({
        defaultValues: {},
    });
    const {
        register,
        control,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = form;

    const getActivityTimeline = (workflow: Workflow) => {
        const activities = workflow.stages
            .flatMap(stage =>
                stage.activities.map(activity => ({
                    ...activity,
                    stageId: stage.id,
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

    function findDoc(documentId: string = searchState) {
        const targetDocumentId = documentId.trim();
        const tracking = TrackingData.find(track => track.document_id == targetDocumentId);
        const doc = FormDetail.find(
            (form) => form.document_id === targetDocumentId
        );
        setDocDetail(doc ?? {})
        if (tracking) {
            const stages = tracking.workflow?.stages.map(stage => ({
                ...stage,
                duration:
                    stage.started_at && stage.completed_at
                        ? dayjs(stage.completed_at).diff(dayjs(stage.started_at), "day")
                        : stage.started_at
                            ? dayjs().diff(dayjs(stage.started_at), "day") // if still in progress
                            : null,
            }));
            setMainStage(stages);
            const activities = getActivityTimeline(tracking.workflow as Workflow);
            setTrackingDataState(tracking as DocumentTracking)
            console.log(activities)
            if (activities) {
                setSubStage(activities)
            }
            // console.log(tracking)
            // console.log(doc)
            // console.log("stage", stages)
            // console.log(activities)
        }

        if (!doc) {
            setDoc(false);
            return;
        }

        const schema = FormSchema.form.find((form) => form.schema_id === doc.schema_id)
        setSelectedForm(schema)

        form.reset(doc.answer);
        setDoc(true);
    }

    function PreviewModal({ fields, onClose }: { fields: FormField[]; onClose: () => void }) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-6"
                style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
                onClick={onClose}
            >
                <div
                    className="flex flex-col w-full max-w-7xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
                    style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                        <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{"ข้อมูลเอกสาร"}</span>
                        <button onClick={onClose} className="hover:cursor-pointer" style={{ color: "var(--muted-foreground)" }}><X size={16} /></button>
                    </div>
                    <div className="overflow-y-auto p-6 flex flex-col gap-5" style={{ scrollbarWidth: "none" }}>
                        {fields == undefined || fields.length == 0 ?
                            (
                                <p style={{ color: "var(--muted-foreground)", fontSize: "1rem", textAlign: "center" }}>
                                    {"ไม่พบข้อมูล"}
                                </p>
                            )
                            :
                            (
                                <div className="grid grid-cols-2 gap-4">
                                    {fields.map((f) => (
                                        <div
                                            key={f.id}
                                            className="flex flex-col gap-1.5"
                                            style={{ gridColumn: f.width === "full" ? "1 / -1" : undefined }}
                                        >
                                            <label style={{ fontSize: "1rem", fontWeight: 500, color: "var(--foreground)" }}>
                                                {f.label}
                                                {f.required && <span style={{ color: "var(--destructive)", marginLeft: "0.25rem" }}>*</span>}
                                            </label>
                                            <FieldPreview field={f} control={form.control as Control} setValue={form.setValue} getValues={form.getValues} mode={mode} />
                                            {f.helpText && (
                                                <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{f.helpText}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>
                </div>
            </div>
        );
    }

    function DetailModal({ onClose }: { onClose: () => void }) {
        const { stage } = detail
        const modal_detail = () => {
            if (stage === "approve") {
                return docDetail.approval.steps.flatMap((step: any) =>
                    step.approvers.map((approver: any) => ({
                        level: step.level,
                        status: step.status,
                        ...approver,
                    })));
            } else {
                return mainStage.find((sta: any) => sta.id === stage)?.activities ?? [];
            }
        };
        const ProcessingDiff = subStage.filter((sub: any) => sub.stageId == "processing").map((sub: any) => sub.diff);
        const ApproveDiff = () => {
            if (stage == "approve") {
                const diff = subStage.filter((sub: any) => sub.stageId == "approve").map((sub: any) => sub.diff);
                if (docDetail.approval.current_level == diff.lenght && diff.lenght != 1) {
                    const findCurrentDiff = modal_detail().find((act: any) => act.level == docDetail.approval.current_level).approved_at == null ? differenceInDays(new Date(), new Date(modal_detail().find((act: any) => act.level == docDetail.approval.current_level - 1)?.approved_at)) : 0;
                    return [...diff, findCurrentDiff];
                }

                return diff
            }

            return [];
        }

        const findStatus = (status_in: string) => {
            var status = "";
            switch (status_in) {
                case "waiting":
                    status = "รอการอนุมัติ"
                    break;
                case "rejected":
                    status = "ตีกลับ"
                    break;
                case "cancelled":
                    status = "ยกเลิก"
                    break;
                default:
                    status = "อนุมัติแล้ว"
                    break;
            }
            return status
        }

        const findBgColor = (status: string) => {
            var bgColor = "";
            switch (status) {
                case "waiting":
                    bgColor = "bg-[#4A4DF1] text-white";
                    break;
                case "approved":
                    bgColor = "bg-green-500 text-white";
                    break;
                case "cancelled":
                    bgColor = "bg-red-500 text-white";
                    break;
                case "rejected":
                    bgColor = "bg-black text-white";
                    break;
                default:
                    bgColor = "bg-[#e8e8e8]";
            }
            return bgColor;
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
                    <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                        <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{"ขั้นตอน " + stage}</span>
                        <button onClick={onClose} className="hover:cursor-pointer" style={{ color: "var(--muted-foreground)" }}><X size={16} /></button>
                    </div>
                    <div className="overflow-y-auto p-6 flex flex-col gap-5" style={{ scrollbarWidth: "none" }}>
                        <div className="flex gap-2 flex-wrap">
                            <div className="flex gap-2 items-center">
                                <div className="h-2 w-2 p-1 rounded-full bg-[#4A4DF1]"></div>
                                <span>{"กำลังรอการดำเนินการ"}</span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="h-2 w-2 p-1 rounded-full bg-[#e8e8e8]"></div>
                                <span>{"ยังไม่ถึงขั้นตอนการดำเนินการ"}</span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="h-2 w-2 p-1 rounded-full bg-green-500"></div>
                                <span>{"ดำเนินการเรียบร้อยแล้ว"}</span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="h-2 w-2 p-1 rounded-full bg-black"></div>
                                <span>{"เอกสารตีกลับ"}</span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="h-2 w-2 p-1 rounded-full bg-red-500"></div>
                                <span>{"ยกเลิกเอกสาร"}</span>
                            </div>
                        </div>
                        {modal_detail().map((act: any, index: number) => {
                            return (
                                <div key={index}>
                                    {stage == "approve" ? (
                                        <div className={`w-full p-3 flex justify-between rounded-2xl ${findBgColor(docDetail.approval.current_level < act.level ? "pending" : act.status)}`}>
                                            <div>
                                                {`${findStatus(act.status)} by ${act.name}`}
                                            </div>
                                            <div>
                                                {`${docDetail.approval.current_level < act.level ? "รอผู้อนุมัติก่อนหน้า" : "ใช้เวลา "}${ApproveDiff()[index] < 1 ? "น้อยกว่า 1" : ApproveDiff()[index]}${" วัน"}`}
                                            </div>
                                        </div>
                                    ) : stage == "processing" ? (
                                        <div className="w-full bg-green-500 text-white p-3 flex justify-between rounded-2xl">
                                            <div>
                                                {`${act.title} by ${act.performed_by.name}`}
                                            </div>
                                            <div>
                                                {`${ProcessingDiff[index] === null || ProcessingDiff[index] === undefined ? "" : "ใช้เวลา " + ProcessingDiff[index] + " วัน"}`}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full bg-green-500 text-white p-3 flex justify-between rounded-2xl">
                                            <div>
                                                {`${act.title} by ${act.performed_by.name}`}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        );
    }

    const workflowResultActivity = useMemo(() => {
        if (
            TrackingDataState.workflow.status !== "rejected" &&
            TrackingDataState.workflow.status !== "cancelled"
        ) {
            return undefined;
        }

        return TrackingDataState.workflow.stages
            .flatMap(stage => stage.activities)
            .find(activity => activity.type === TrackingDataState.workflow.status);
    }, [TrackingDataState]);

    // useEffect(() => {
    //     const schema = FormDetail.find((form: any) => form.document_id === searchState);

    //     const values =
    //         (FormSchema.form as any)
    //             .find((item: any) => item.schema_id === schema?.schema_id)
    //             ?.form_detail.reduce(
    //                 (acc: Record<string, any>, field: any) => {
    //                     acc[field.id] = "";
    //                     return acc;
    //                 },
    //                 {} as Record<string, any>
    //             ) ?? {};
        
    //     form.reset(values);
    // }, [searchState, form]);

    return (
        <div className="bg-slate-50 min-h-screen h-full w-full p-6">
            <div className='flex items-center gap-4'>
                <Link href={'/dashboard'}>
                    <div className='text-white p-2 bg-[#1b1b1b] rounded-md flex justify-between items-center gap-1'>
                        <Icon icon={"tabler:arrow-left"} className='text-lg' />
                    </div>
                </Link>
                <div className="">
                    <h1 className="text-2xl font-bold">{"ติดตามเอกสาร"}</h1>
                    <span>{"ค้นหาและตรวจสอบเอกสารด้วยรหัสเอกสาร"}</span>
                </div>
            </div>
            <div className="mt-5 bg-white border rounded-xl px-5 py-6 shadow w-full">
                <div className="flex gap-4 w-full">
                    <div className="w-full flex items-center">
                        <input
                            type="text" className="relative w-full p-1.5 pl-8 py-3 border rounded bg-[#F3F4F8] text-md" placeholder="รหัสเอกสาร (e.g. DOC-IT-001)"
                            value={searchState}
                            onChange={e => { SetSearchState(e.target.value) }}
                        />
                        <Icon icon={'iconamoon:search-light'} className="absolute ml-2 text-[#7E7F81] text-lg" />
                    </div>
                    <button
                        className="p-2 px-6 text-white bg-[#4A4DF1] rounded-lg hover:cursor-pointer"
                        onClick={() => {
                            const targetDocumentId = searchState.trim();
                            SetSearchState(targetDocumentId);
                            findDoc(targetDocumentId);
                        }}
                    >
                        {'ค้นหา'}
                    </button>
                </div>
            </div>

            <div className='mt-5 bg-white border rounded-xl px-5 py-4 shadow w-full'>
                <div className="text-2xl font-bold">
                    <span>{"เอกสารที่แก้ไขล่าสุด"}</span>
                </div>
            <div className="grid grid-cols-3 gap-4">
                {last.map((item, index) => (
                    <button
                        key={index}
                        className="flex justify-between min-w-1/4 p-2 px-4 text-sm bg-[#ebebeb] rounded-xl shadow border hover:cursor-pointer hover:bg-[#f0f0f0]"
                        onClick={() => {
                            SetSearchState(item.document_id)
                            findDoc(item.document_id)
                        }}
                    >
                        <div className="flex flex-col items-start w-[60%]">
                            <div>
                                <span>{item.document_id}</span>
                            </div>
                            <div className="text-nowrap overflow-x-hidden scrollbar-none">
                                <span>{item.title}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end w-[40%]">
                            <div>
                                <span>{"ผู้สร้าง "}{item.owner}</span>
                            </div>
                            <div>
                                <span>{"แก้ไขล่าสุด "}{item.updated_at}</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
            </div>
            {doc ? (
                <div>
                    <div className="mt-5 bg-white border rounded-xl px-5 py-4 shadow w-full">
                        <div className="flex justify-between">
                            <div>
                                <div className="flex items-center">
                                    <span className="">{TrackingDataState.department ?? ""}</span>
                                    <Icon icon={'mdi:keyboard-arrow-right'} className="" />
                                    <span className="text-[#3D52D5] font-bold">{" " + TrackingDataState.document_id}</span>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold">{TrackingDataState.title}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex gap-2 text-[14px]">
                                    <div className="px-2">
                                        <span>{"เจ้าของเอกสาร"}</span>
                                        <div className="flex items-center gap-0.5">
                                            <Icon icon={'iconoir:user'} />
                                            <span>{TrackingDataState.created_by.name}</span>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <span>{"ฝ่าย/แผนก"}</span>
                                        <div className="flex items-center gap-0.5">
                                            <Icon icon={'icon-park-outline:new-computer'} />
                                            <span>{TrackingDataState.department}</span>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <span>{"สร้างเมื่อ"}</span>
                                        <div className="flex items-center gap-0.5">
                                            <Icon icon={'boxicons:calendar'} />
                                            <span>{TrackingDataState.workflow.stages[0].started_at}</span>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <span>{"วันที่สิ้นสุดเอกสาร"}</span>
                                        <div className="flex items-center gap-0.5">
                                            <Icon icon={'boxicons:calendar'} />
                                            <span>{TrackingDataState.due_date}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <PriorityBadge status={TrackingDataState.priority} />
                                </div>
                                <div>
                                    <button className="p-2 text-white bg-black rounded-lg hover:cursor-pointer flex items-center gap-2" onClick={() => setPreview(true)}>
                                        <Eye size={14} />
                                        <span>{"ดูเอกสาร"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 bg-white border rounded-xl px-5 py-4 shadow w-full">
                        <div>
                            <span className="font-semibold text-xl">{"Workflow Progress"}</span>
                        </div>
                        <div className="mt-10">
                            <Stepper
                                defaultValue={1}
                                value={steps.findIndex((track) => track.value === TrackingDataState.workflow.current_stage) + 1 > 4 ? 4 : steps.findIndex((track) => track.value === TrackingDataState.workflow.current_stage) + 1}
                                indicators={{
                                    completed: (
                                        <CheckIcon className="size-3.5" />
                                    ),
                                    loading: (
                                        <LoaderCircleIcon className="size-3.5 animate-spin" />
                                    ),
                                }}
                                className="w-full space-y-8"
                            >
                                <StepperNav>
                                    {TrackingDataState.workflow.stages.map((stage, index) => {
                                        const stepNumber = index + 1;

                                        const isCompleted = stage.status === "completed";
                                        const isLoading = stage.status === "in_progress";
                                        const isCancelled = stage.status === "cancelled";
                                        const isRejected = stage.status === "rejected";
                                        return (
                                            <StepperItem
                                                key={stage.id}
                                                step={stepNumber}
                                                completed={isCompleted}
                                                loading={isLoading}
                                                className="relative flex-1 items-start"
                                                onClick={() => setDetail({ open: true, stage: stage.id })}
                                            >
                                                <StepperTrigger className="flex flex-col gap-2.5">
                                                    <StepperIndicator
                                                        className={`data-[state=completed]:bg-green-500 data-[state=completed]:text-white data-[state=inactive]:text-gray-500`}
                                                    >
                                                        {isCancelled || isRejected ? (
                                                            <XIcon className={`${isCancelled
                                                                ? "bg-red-500 text-white"
                                                                : isRejected
                                                                    ? "text-white"
                                                                    : "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                                                }`} />
                                                        ) : (
                                                            stepNumber
                                                        )}
                                                    </StepperIndicator>

                                                    <StepperTitle>{stage.name}</StepperTitle>

                                                    <StepperDescription>
                                                        {stage.activities.at(-1)?.title ?? ""}
                                                    </StepperDescription>
                                                    <StepperDescription>
                                                        {`${mainStage[index].duration == null ? "" : "ใช้เวลา "}${mainStage[index].duration == null ? "ยังไม่ถึงขั้นตอน" : mainStage[index].duration < 1 ? "น้อยกว่า 1" : mainStage[index].duration}${mainStage[index].duration == null ? "" : " วัน"}`}
                                                    </StepperDescription>
                                                </StepperTrigger>

                                                {TrackingDataState.workflow.stages.length > index + 1 && (
                                                    <StepperSeparator
                                                        className="group-data-[state=completed]/step:bg-green-500 absolute inset-x-0 top-2.5 left-[calc(50%+0.875rem)] m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem+0.225rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none"
                                                    />
                                                )}
                                            </StepperItem>
                                        );
                                    })}
                                </StepperNav>
                            </Stepper>
                        </div>
                    </div>

                    <div className="mt-5 bg-white border rounded-xl px-5 py-4 shadow w-full">
                        <div>
                            <span className="font-bold text-xl">{"Activity History"}</span>
                        </div>
                        <div className="flex items-center justify-start mt-4">
                            <Stepper
                                className="flex flex-col justify-center gap-10"
                                value={subStage.length}
                                orientation="vertical"
                            >
                                <StepperNav>
                                    {subStage.map((step: WorkflowActivity, index: number) => {
                                        return (
                                            <StepperItem
                                                key={index}
                                                step={index + 1}
                                                className="relative items-start not-last:flex-1"
                                            >
                                                <StepperTrigger className="items-start gap-2.5 pb-8 px-1.5 mt-2 last:pb-0">
                                                    <StepperIndicator className="data-[state=completed]:bg-[#4A4DF1] data-[state=active]:bg-[#4A4DF1] data-[state=inactive]:bg-[#4A4DF1] data-[state=completed]:text-white size-3">
                                                        {''}
                                                    </StepperIndicator>
                                                    <div className="mt-0.5 text-left">
                                                        <StepperTitle><span className="font-semibold">{step.title}</span>{" by " + step.performed_by.name}</StepperTitle>
                                                        <StepperDescription>{step.description}</StepperDescription>
                                                        <div className="flex gap-2">
                                                            <StepperDescription>{step.datetime}</StepperDescription>
                                                            <StepperDescription>{`${subStage[index].diff == 0 ? "ใช้เวลา น้อยกว่า 1 วัน" : subStage[index].diff ? "ใช้เวลา " + subStage[index].diff : ""} ${subStage[index].diff ? " วัน" : ""}`}</StepperDescription>
                                                        </div>
                                                    </div>
                                                </StepperTrigger>
                                                {index < subStage.length - 1 && (
                                                    <StepperSeparator className="group-data-[state=completed]/step:bg-[#E2E5EF] group-data-[state=active]/step:bg-[#E2E5EF] group-data-[state=inactive]/step:bg-[#E2E5EF] absolute inset-y-0 top-7 left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=vertical]/stepper-nav:h-[calc(100%-2rem)]" />
                                                )}
                                            </StepperItem>
                                        )
                                    })}
                                </StepperNav>
                            </Stepper>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="mt-5 bg-white border rounded-xl px-5 py-4 shadow w-full">
                        <div className="flex flex-col justify-center items-center p-10">
                            <Icon icon={'iconoir:search'} className="text-[#D2D4D9] text-[48px]" />
                            <span className="text-lg">{'ใส่เลขที่เอกสารเพื่อค้นหาเอกสารที่ต้องการ'}</span>
                        </div>
                    </div>
                </div>
            )}

            {(TrackingDataState.workflow.status === "cancelled" || TrackingDataState.workflow.status === "rejected") && (
                <div className="mt-5 bg-white border rounded-xl px-5 py-4 shadow w-full">
                    <div className="">
                        <span className="font-semibold text-xl">{"เหตุผลที่ตีกลับหรือยกเลิกเอกสาร"}</span>
                        <div className="w-full border rounded-lg">
                            <textarea rows={3} value={workflowResultActivity?.description ?? ""} className="w-full p-2" disabled />
                        </div>
                    </div>
                </div>
            )}

            {preview && <PreviewModal fields={selectedForm?.form_detail as FormField[]} onClose={() => setPreview(false)} />}
            {detail.open && <DetailModal onClose={() => setDetail({ open: false, stage: "" })} />}
        </div>
    )
}