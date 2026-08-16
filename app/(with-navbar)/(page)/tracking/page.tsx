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
import { Activity, useEffect, useMemo, useState } from "react";
import TrackingData from "@/SampleData/tracking.json"
import FormSchema from "@/SampleData/form.json"
import FormDetail from "@/SampleData/form_detail.json"
import { Control, Controller, useForm } from "react-hook-form";
import { FieldPreview } from "@/app/component/FormRender";
import { PriorityBadge } from "@/app/component/PriorityBadge";
import { DocumentTracking, DocumentTrackingRecord, Workflow, WorkflowActivity } from "./tracking";
import dayjs from "dayjs";
import { differenceInDays } from "date-fns";
import { useGetTracking } from '@/hooks/set-tracking';
import { useTrackingStore } from '@/store/tracking.store';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone'
import { useSearchTracking } from '@/hooks/search-tracking';
import { useSearchTrackingDetail } from '@/hooks/search-tracking-detail';

dayjs.extend(utc);
dayjs.extend(timezone);

const mock = {
  documentNo: "DOC-IT-20260814-001",
  status: "PROCESSING",
  dueDate: "2026-08-20T17:00:00.000Z",
  createdBy: {
    firstName: "นครินทร์"
  },
  createdAt: "2026-08-14T02:52:49.421Z",
  revisions: [
    {
      snapshot: "[{\"id\":\"37114ac2-abf4-4e5f-8bfc-ae4ff78e9f23\",\"type\":\"employee_detail\",\"label\":\"ข้อมูลพนักงาน\",\"placeholder\":\"\",\"required\":true,\"helpText\":\"\",\"width\":\"full\"},{\"id\":\"82fcb2f7-cf21-4d19-b3cf-d5894da00403\",\"type\":\"text\",\"label\":\"สาเหตุ\",\"placeholder\":\"\",\"required\":true,\"helpText\":\"\",\"width\":\"full\"},{\"id\":\"e6c74fd2-6434-4081-be95-6c0ba16466ba\",\"type\":\"table\",\"label\":\"รายการทรัพย์สิน\",\"placeholder\":\"\",\"required\":false,\"helpText\":\"\",\"width\":\"full\",\"minRows\":1,\"maxRows\":20,\"columns\":[{\"id\":\"col-1\",\"label\":\"รหัสทรัพย์สิน\",\"type\":\"text\",\"width\":1},{\"id\":\"col-2\",\"label\":\"รายการ\",\"type\":\"text\",\"width\":2},{\"id\":\"col-3\",\"label\":\"จำนวน\",\"type\":\"number\",\"width\":1},{\"id\":\"col-4\",\"label\":\"หน่วย\",\"type\":\"text\",\"width\":1},{\"id\":\"col-11\",\"label\":\"สถานที่จัดเก็บ\",\"type\":\"text\",\"width\":1}]}]",
      formData: "{\"37114ac2-abf4-4e5f-8bfc-ae4ff78e9f23\":{\"employee_code\":\"2169089\",\"position\":\"เจ้าหน้าที่พัฒนาซอฟต์แวร์\",\"division\":\"เทคโนโลยีสารสนเทศ\",\"department\":\"พัฒนาเทคโนโลยีโซลูชั่น\",\"first_name\":\"Mock Name 13\",\"last_name\":\"Mock Surname 13\",\"company\":\"cff\"},\"82fcb2f7-cf21-4d19-b3cf-d5894da00403\":\"เริ่มงานใหม่\",\"e6c74fd2-6434-4081-be95-6c0ba16466ba\":[{\"col-1\":\"WF-20342-342\",\"col-2\":\"โน๊ตบุ๊ค\",\"col-3\":\"1\",\"col-4\":\"เครื่อง\",\"col-11\":\"บางบอนชั้น 2\"}]}"
    }
  ],
  formSchema: {
    name: "แบบฟอร์มเบิกทรัพย์สิน",
    division: {
      name: "Innovation Technology"
    }
  },
  workflowInstance: {
    executions: [
      {
        steps: [
          {
            level: 1,
            status: "COMPLETED",
            decision: "APPROVE",
            startedAt: "2026-08-14T02:52:49.427Z",
            actedAt: "2026-08-14T02:58:04.280Z",
            employee: {
              firstName: "ทศวรรษ"
            }
          },
          {
            level: 2,
            status: "COMPLETED",
            decision: "APPROVE",
            startedAt: "2026-08-14T02:58:04.303Z",
            actedAt: "2026-08-14T02:58:50.453Z",
            employee: {
              firstName: "ประวีณพร"
            }
          }
        ]
      }
    ]
  },
  processInstances: [
    {
      processInstanceTasks: [
        {
          description: "ลงโปรแกรมพื้นฐาน",
          processBy: {
            firstName: "ธีรวัฒน์"
          },
          createAt: "2026-08-14T02:59:38.530Z"
        },
        {
          description: "ตรวจสอบการใช้งาน",
          processBy: {
            firstName: "ธีรวัฒน์"
          },
          createAt: "2026-08-14T07:58:18.651Z"
        }
      ]
    }
  ],
  activities: [
    {
      id: "070bbbe1-99c8-4ac5-ac84-bee2ed146534",
      documentId: "c1c0f5ed-3985-4749-8efd-920729cb885d",
      type: "SUBMITTED",
      message: "นำเอกสารเข้าสู่ระบบ",
      metadata: "",
      createdById: "c4a70a34-edb8-4ac6-b897-c288df4a8f1f",
      createdAt: "2026-08-14T02:52:49.435Z",
      createdBy: {
        firstName: "นครินทร์"
      }
    },
    {
      id: "1f3031ce-3efa-4dc2-bf2b-3ef4b5d67199",
      documentId: "c1c0f5ed-3985-4749-8efd-920729cb885d",
      type: "APPROVED",
      message: "อนุมัติเอกสาร",
      metadata: "",
      createdById: "d716601b-a050-4796-b8fb-568027241def",
      createdAt: "2026-08-14T02:58:04.306Z",
      createdBy: {
        firstName: "ทศวรรษ"
      }
    },
    {
      id: "c8d17e27-7552-4ab2-83a2-cc3ee942b5e1",
      documentId: "c1c0f5ed-3985-4749-8efd-920729cb885d",
      type: "APPROVED",
      message: "อนุมัติเอกสาร",
      metadata: "",
      createdById: "dfaa6274-95c9-47ab-86e8-0626950b7cd3",
      createdAt: "2026-08-14T02:58:50.459Z",
      createdBy: {
        firstName: "ประวีณพร"
      }
    },
    {
      id: "0b814d79-9b3c-4b37-953d-55b99b125d3a",
      documentId: "c1c0f5ed-3985-4749-8efd-920729cb885d",
      type: "PROCESS_NOTE",
      message: "ลงโปรแกรมพื้นฐาน",
      metadata: "",
      createdById: "f206592e-7045-4121-b0eb-68ebb4f18752",
      createdAt: "2026-08-14T02:59:38.532Z",
      createdBy: {
        firstName: "ธีรวัฒน์"
      }
    },
    {
      id: "6054f95a-efb3-4939-8113-4f3d4ee0b77c",
      documentId: "c1c0f5ed-3985-4749-8efd-920729cb885d",
      type: "PROCESS_NOTE",
      message: "ตรวจสอบการใช้งาน",
      metadata: "",
      createdById: "f206592e-7045-4121-b0eb-68ebb4f18752",
      createdAt: "2026-08-14T07:58:18.655Z",
      createdBy: {
        firstName: "ธีรวัฒน์"
      }
    }
  ]
}

export default function Page() {
    useGetTracking();
    const searchDetail = useSearchTrackingDetail();
    const searchDocument = useTrackingStore((state) => state.SearchDocument)
    const detailDocument = useTrackingStore((state) => state.SearchDocumentDetail)

    const { search: triggerSearch } = useSearchTracking();
    const [doc, setDoc] = useState(false);
    const [selectedForm, setSelectedForm] = useState<any>(null);
    const [mainStage, setMainStage] = useState<any[]>([]);
    const [subStage, setSubStage] = useState<any>([]);
    const [docDetail, setDocDetail] = useState<any>([]);
    const [searchDoc, setSearchDoc] = useState<any>([]);

    useEffect(() => {
        setSearchDoc(searchDocument);
    }, [searchDocument, setSearchDoc]);
    const lastestDoc = useTrackingStore((state) => state.LastestDocument)
    const steps = [
        { title: "Created", description: "สร้างเอกสาร", value: "created" },
        { title: "Approve", description: "ตรวจสอบและอนุญาติ", value: "approve" },
        { title: "Processing", description: "ดำเนินการ", value: "processing" },
        { title: "Complete", description: "ตรวจสอบและจัดเก็บ", value: "complete" },
    ]

    const [searchState, SetSearchState] = useState("");
    //doc status =  created | draft | approved | rejected | process | completed | cancelled
    const [preview, setPreview] = useState(false);
    const [detail, setDetail] = useState({
        open: false,
        stage: ""
    });

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

    function search(keyword: string) {
        triggerSearch(keyword);
    }

    async function findDoc(documentId: string = searchState) {
        const word = documentId.trim();
        // await the search so the store is populated before we read it
        await searchDetail.searchAsync(word);

        // read fresh store state after mutation
        const dd = useTrackingStore.getState().SearchDocumentDetail as any;

        const activity = [
            {
                stage: "submit",
                status: "COMPLETE",
                activity: (dd?.activities ?? []).filter((item: any) => (item.type ?? "").includes("SUBMIT"))
            },
            {
                stage: "approve",
                status: dd?.status === "WAITING_APPROVAL" ? "IN_PROCESS" : dd?.status === "APPROVER_CANCELLED" ? "CANCELLED" : dd?.status === "APPROVER_REJECTED" ? "REJECTED" : "COMPLETE",
                activity: (dd?.activities ?? []).filter((item: any) => (item.type ?? "").includes("APPROVE")),
                sub_stage: dd?.workflowInstance?.executions?.[0]?.steps ?? []
            },
            {
                stage: "process",
                status: dd?.status === "PROCESSING" ? "IN_PROCESS" : dd?.status === "PROCESSOR_CANCELLED" ? "CANCELLED" : dd?.status === "PROCESSOR_REJECTED" ? "REJECTED" : "COMPLETE",
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

        const snapshot = dd?.revisions?.[0]?.snapshot ?? '[]';
        const schema = JSON.parse(snapshot);
        setSelectedForm(schema)

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

    function findCurrentStage(status: string) {
        if (status === "WAITING_APPROVAL") {
            return 2;
        } else if (status === "PROCESSING") {
            return 3;
        } else if (status === "COMPLETE") {
            return 4;
        }
    }

    function DetailModal({ onClose }: { onClose: () => void }) {
        const { stage } = detail
        const modal_detail = mainStage.find((stg) => stg.stage === stage)
        // else {
        //     return mainStage.find((sta: any) => sta.id === stage)?.activities ?? [];
        // }
        const Approver = () => modal_detail.sub_stage.map((step: any, index: number) => {
            const compareDate = detailDocument.createdAt;

            const startedAt = new Date(step.startedAt).getTime();
            const actedAt = new Date(step.actedAt).getTime();

            const previousActedAt =
                index === 0
                    ? new Date(compareDate).getTime()
                    : new Date(modal_detail.sub_stage[index - 1].actedAt).getTime();

            const MS_PER_DAY = 1000 * 60 * 60 * 24;
            const spentDays = (actedAt - startedAt) / MS_PER_DAY;
            const waitDays = (startedAt - previousActedAt) / MS_PER_DAY;

            return {
                ...step,
                // 1. How long this step took (in days). If less than 1 day, set to -1.
                timeSpent: spentDays < 1 ? -1 : Math.floor(spentDays),
                // 2. Waiting time before this step started (in days). If less than 1 day, set to -1.
                timeDiff: waitDays < 1 ? -1 : Math.floor(waitDays),
            };
        });

        const Processor = () => modal_detail.sub_stage.map((proc: any, index: number) => {
            const len = detailDocument.workflowInstance.executions[0].steps.length
            const processStartedAt = detailDocument.workflowInstance.executions[0].steps[len-1].actedAt
            const currentTime = new Date(proc.createAt).getTime();

            const previousTime =
                index === 0
                    ? new Date(processStartedAt).getTime()
                    : new Date(modal_detail.sub_stage[index - 1].createAt).getTime();

            const diff = currentTime - previousTime;
            console.log(diff)
            return {
                ...proc,
                timeDiff: Math.floor(diff / 3600000),
            };
        })


        const findStatus = (status: string, decision: string) => {
            if (status === "PENDING") {
                return "รอการอนุมัติ"
            } else if (status === "COMPLETED") {
                if (decision === "APPROVE") return "อนุมัติแล้ว"
                if (decision === "CANCELLED") return "ยกเลิกเอกสาร"
                if (decision === "REJECTED") return "ตีกลับเอกสาร"
            } else {
                return "ยังไม่ถึงขั้นตอน"
            }
        }

        const findBgColor = (status: string, decision?: string) => {
            if (status === "PENDING") {
                return "bg-[#4A4DF1] text-white"
            } else if (status === "COMPLETED") {
                if (decision === "APPROVE") return "bg-green-500 text-white"
                if (decision === "CANCELLED") return "bg-red-500 text-white"
                if (decision === "REJECTED") return "bg-black text-white"
            } else {
                return "bg-[#e8e8e8]"
            }
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
                        <div className='space-y-2'>
                            {stage == "approve" ? (
                                Approver().map((act: any, index: number) => (
                                    <div key={index} className={`w-full p-3 flex justify-between rounded-2xl ${findBgColor(act.status, act.decision)}`}>
                                        <div>
                                            {`${findStatus(act.status, act.decision)} by ${act.employee.firstName}`}
                                        </div>
                                        <div>
                                            {`${act.timeSpent === -1 ? "ใช้เวลาน้อยกว่า 1 วัน" : act.timeSpent + " วัน"}`}
                                        </div>
                                    </div>
                                ))
                            ) : stage == "process" ? (
                                Processor().map((pro: any, index: number) => (
                                    <div key={index} className="w-full bg-green-500 text-white p-3 flex justify-between rounded-2xl">
                                        <div>
                                            {`${pro.description} by ${pro.processBy.firstName}`}
                                        </div>
                                        <div>
                                            {`${pro.diff > 0 ? pro.diff + " ชั่วโมง" : "น้อยกว่า 1 ชั่วโมง"}`}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="w-full bg-green-500 text-white p-3 flex justify-between rounded-2xl">
                                    <div>
                                        {`${modal_detail.activity[0].message} by ${modal_detail.activity[0].createdBy.firstName}`}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                                    <span className="">{detailDocument.formSchema.division.name ?? ""}</span>
                                    <Icon icon={'mdi:keyboard-arrow-right'} className="" />
                                    <span className="text-[#3D52D5] font-bold">{" " + detailDocument.documentNo}</span>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold">{detailDocument.formSchema.name}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex gap-2 text-[14px]">
                                    <div className="px-2">
                                        <span>{"เจ้าของเอกสาร"}</span>
                                        <div className="flex items-center gap-0.5">
                                            <Icon icon={'iconoir:user'} />
                                            <span>{detailDocument.createdBy.firstName}</span>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <span>{"ฝ่าย/แผนก"}</span>
                                        <div className="flex items-center gap-0.5">
                                            <Icon icon={'icon-park-outline:new-computer'} />
                                            <span>{detailDocument.formSchema.division.name}</span>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <span>{"สร้างเมื่อ"}</span>
                                        <div className="flex items-center gap-0.5">
                                            <Icon icon={'boxicons:calendar'} />
                                            <span>{dayjs.utc(detailDocument.createdAt).tz("Asia/Bangkok").format("DD-MM-YYYY")}</span>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <span>{"วันที่สิ้นสุดเอกสาร"}</span>
                                        <div className="flex items-center gap-0.5">
                                            <Icon icon={'boxicons:calendar'} />
                                            <span>{dayjs.utc(detailDocument.dueDate).tz("Asia/Bangkok").format("DD-MM-YYYY")}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <PriorityBadge status={"high"} />
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
                                value={findCurrentStage(detailDocument.status)}
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
                                    {mainStage.map((stage, index) => {
                                        const stepNumber = index + 1;

                                        const isCompleted = stage.status === "COMPLETED";
                                        const isLoading = stage.status === "IN_PROCESS";
                                        const isCancelled = stage.status === "cancelled";
                                        const isRejected = stage.status === "rejected";
                                        return (
                                            <StepperItem
                                                key={index}
                                                step={stepNumber}
                                                completed={isCompleted}
                                                loading={isLoading}
                                                className="relative flex-1 items-start"
                                                onClick={() => setDetail({ open: true, stage: stage.stage })}
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

                                                    <StepperTitle>{stage.stage}</StepperTitle>

                                                    <StepperDescription>
                                                        {stage.activity.at(-1)?.message ?? ""}
                                                    </StepperDescription>
                                                    <StepperDescription>
                                                        {/* {`${mainStage[index].duration == null ? "" : "ใช้เวลา "}${mainStage[index].duration == null ? "ยังไม่ถึงขั้นตอน" : mainStage[index].duration < 1 ? "น้อยกว่า 1" : mainStage[index].duration}${mainStage[index].duration == null ? "" : " วัน"}`} */}
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
                                value={detailDocument.activities.length}
                                orientation="vertical"
                            >
                                <StepperNav>
                                    {detailDocument.activities.map((step: any, index: number) => {
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
                                                        <StepperTitle><span className="font-semibold">{step.message}</span>{" by " + step.createdBy.firstName}</StepperTitle>
                                                        <StepperDescription>{step.message}</StepperDescription>
                                                        <div className="flex gap-2">
                                                            <StepperDescription>{dayjs.utc(step.createdAt).tz("Asia/Bangkok").format("DD-MM-YYYY")}</StepperDescription>
                                                            <StepperDescription>{``}</StepperDescription>
                                                        </div>
                                                    </div>
                                                </StepperTrigger>
                                                {index < detailDocument.activities.length - 1 && (
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
                            {/* <textarea rows={3} value={workflowResultActivity?.description ?? ""} className="w-full p-2" disabled /> */}
                        </div>
                    </div>
                </div>
            )}

            {preview && <PreviewModal fields={selectedForm as FormField[]} onClose={() => setPreview(false)} />}
            {detail.open && <DetailModal onClose={() => setDetail({ open: false, stage: "" })} />}
        </div>
    )
}