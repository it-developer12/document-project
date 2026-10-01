"use client"
import { Icon } from '@iconify/react';
import Link from "next/link";
import { Eye, X } from 'lucide-react'
import { useEffect, useState } from "react";
import { Control, Controller, useForm } from "react-hook-form";
import { PriorityBadge } from "@/app/component/PriorityBadge";
import { DocumentTracking, Workflow } from "./tracking";
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


export default function Page() {
    useGetTracking();
    const searchDetail = useSearchTrackingDetail();
    const searchDocument = useTrackingStore((state) => state.SearchDocument)
    const detailDocument = useTrackingStore((state) => state.SearchDocumentDetail)

    const { search: triggerSearch } = useSearchTracking();
    const [doc, setDoc] = useState(false);
    const [selectedForm, setSelectedForm] = useState<any>(null);
    const [mainStage, setMainStage] = useState<any[]>([]);
    const [searchDoc, setSearchDoc] = useState<any>([]);

    useEffect(() => {
        setSearchDoc(searchDocument);
    }, [searchDocument, setSearchDoc]);
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
    const {
        register,
        control,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = form;

    function search(keyword: string) {
        triggerSearch(keyword);
    }

    async function findDoc(documentId: string = searchState) {
        const word = documentId.trim();
        // await the search so the store is populated before we read it
        await searchDetail.searchAsync(word);

        // read fresh store state after mutation
        const dd = useTrackingStore.getState().SearchDocumentDetail.document as any;
        const activity = [
            {
                stage: "submit",
                status: "COMPLETE",
                activity: (dd?.activities ?? []).filter((item: any) => (item.type ?? "").includes("SUBMIT"))
            },
            {
                stage: "approve",
                status: dd.workflowInstance.executions[0].status === "REJECTED" ? "REJECTED" : dd.workflowInstance.executions[0].status === "CANCELLED" ? "CANCELLED" : dd.workflowInstance.executions[0].status === "RUNNING" ? "IN_PROCESS" : "COMPLETED",
                activity: (dd?.activities ?? []).filter((item: any) => (item.type ?? "").includes("APPROVE")),
                sub_stage: dd?.workflowInstance?.executions?.[0]?.steps ?? []
            },
            {
                stage: "process",
                status: dd?.status === "PROCESSING" ? "IN_PROCESS" : dd.status === "COMPLETED" ? "COMPLETED" : "",
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
        const comment = dd?.workflowInstance?.executions[0]?.steps.find((step: any) => step.decision === "REJECT" || step.decision === "CANCEL")?.comment ?? ""
        const snapshot = dd?.revisions?.[0]?.snapshot ?? '[]';
        const schema = JSON.parse(snapshot);
        setSelectedForm(schema)
        setCommentState(comment)
        const formData = dd?.revisions?.[0]?.formData ?? '{}';
        const answer = JSON.parse(formData)

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
            stage = data.workflowInstance.executions[0].status === "REJECTED" || data.workflowInstance.executions[0].status === "CANCELLED" ? 2 : 3
        } else if (data.status === "COMPLETED") {
            stage = 4
        }

        return stage;
    }

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
                            search(targetDocumentId)
                        }}
                    >
                        {'ค้นหา'}
                    </button>
                </div>
            </div>

            {searchDoc.length > 0 && (
                <div className='mt-5 bg-white border rounded-xl px-5 py-6 shadow w-full'>
                    <div className="grid grid-cols-3 gap-4">
                        {searchDoc.map((item: any, index: number) => (
                            <button
                                key={index}
                                className="flex justify-between min-w-1/4 p-2 px-4 text-sm bg-[#ebebeb] rounded-xl shadow border hover:cursor-pointer hover:bg-[#f0f0f0]"
                                onClick={() => {
                                    SetSearchState(item.document.documentNo)
                                    findDoc(item.document.documentNo)
                                }}
                            >
                                <div className="flex flex-col items-start w-[60%]">
                                    <div>
                                        <span>{item.document.documentNo}</span>
                                    </div>
                                    <div className="text-nowrap overflow-x-hidden scrollbar-none">
                                        <span>{item.document.formSchema.name}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end w-[40%]">
                                    <div>
                                        <span>{"ผู้สร้าง "}{item.document.createdBy.firstName}</span>
                                    </div>
                                    <div>
                                        <span>{"แก้ไขล่าสุด "}{dayjs.utc(item.createdAt).tz("Asia/Bangkok").format("DD-MM-YYYY")}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className='mt-5 bg-white border rounded-xl px-5 py-4 shadow w-full'>
                <div className="text-2xl font-bold">
                    <span>{"เอกสารที่แก้ไขล่าสุด"}</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-4">
                    {lastestDoc.map((item, index) => (
                        <button
                            key={index}
                            className="flex justify-between min-w-1/4 p-2 px-4 text-sm bg-[#ebebeb] rounded-xl shadow border hover:cursor-pointer hover:bg-[#f0f0f0]"
                            onClick={() => {
                                SetSearchState(item.document.documentNo)
                                findDoc(item.document.documentNo)
                            }}
                        >
                            <div className="flex flex-col items-start w-[60%]">
                                <div>
                                    <span>{item.document.documentNo}</span>
                                </div>
                                <div className="text-nowrap overflow-x-hidden scrollbar-none">
                                    <span>{item.document.formSchema.name}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end w-[40%]">
                                <div>
                                    <span>{"ผู้สร้าง "}{item.document.createdBy.firstName}</span>
                                </div>
                                <div>
                                    <span>{"แก้ไขล่าสุด "}{dayjs.utc(item.createdAt).tz("Asia/Bangkok").format("DD-MM-YYYY")}</span>
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
                                    <span className="">{detailDocument.document.formSchema.division?.name ?? ""}</span>
                                    <Icon icon={'mdi:keyboard-arrow-right'} className="" />
                                    <span className="text-[#3D52D5] font-bold">{" " + detailDocument.document.documentNo}</span>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold">{detailDocument.document.formSchema.name}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex gap-2 text-[14px]">
                                    <div className="px-2">
                                        <span>{"เจ้าของเอกสาร"}</span>
                                        <div className="flex items-center gap-0.5">
                                            <Icon icon={'iconoir:user'} />
                                            <span>{detailDocument.document.createdBy.firstName}</span>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <span>{"ฝ่าย/แผนก"}</span>
                                        <div className="flex items-center gap-0.5">
                                            <Icon icon={'icon-park-outline:new-computer'} />
                                            <span>{detailDocument.document.formSchema.division?.name}</span>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <span>{"สร้างเมื่อ"}</span>
                                        <div className="flex items-center gap-0.5">
                                            <Icon icon={'boxicons:calendar'} />
                                            <span>{dayjs.utc(detailDocument.document.createdAt).tz("Asia/Bangkok").format("DD-MM-YYYY")}</span>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <span>{"วันที่สิ้นสุดเอกสาร"}</span>
                                        <div className="flex items-center gap-0.5">
                                            <Icon icon={'boxicons:calendar'} />
                                            <span>{dayjs.utc(detailDocument.document.dueDate).tz("Asia/Bangkok").format("DD-MM-YYYY")}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <PriorityBadge status={detailDocument.document.priority} />
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

                    <WorkflowProgress
                        stages={mainStage}
                        currentStage={findCurrentStage(detailDocument.document)}
                        separatorCount={4}
                        onStageClick={(stage) => setDetail({ open: true, stage })}
                    />
                    {(detailDocument.document.status === "CANCELLED" || detailDocument.document.status === "REJECTED") && (
                        <div className="mt-5 bg-white border rounded-xl px-5 py-4 shadow w-full">
                            <div className="">
                                <span className="font-semibold text-xl">{"เหตุผลที่ตีกลับหรือยกเลิกเอกสาร"}</span>
                                <div className="w-full border rounded-lg">
                                    <textarea rows={3} value={commentState ?? ""} className="w-full p-2" disabled />
                                </div>
                            </div>
                        </div>
                    )}
                    <ActivityHistory activities={detailDocument.document.activities} />
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

            {preview && <TrackingPreviewModal fields={selectedForm as FormField[]} form={form} onClose={() => setPreview(false)} />}
            {detail.open && <TrackingDetailModal stage={detail.stage} stages={mainStage} document={detailDocument} onClose={() => setDetail({ open: false, stage: "" })} />}
        </div>
    )
}