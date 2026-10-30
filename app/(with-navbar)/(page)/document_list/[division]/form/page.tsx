'use client'
import { useForm, SubmitHandler, Control, Controller } from "react-hook-form"
import { FieldPreview } from "@/app/component/FormRender";
import { ArrowLeft, ChevronDownIcon } from "lucide-react"
import { StatusBadge } from "@/app/component/StatusBadge";
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Select from 'react-select'
import { useRouter, useSearchParams } from "next/navigation";
import { startOfDay, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import { toast } from "react-toastify";
import Loading from "@/app/component/loading";
import { useApproveMutation } from "@/hooks/approve-document";
import { useCreateDocument } from "@/hooks/create-document";
import { useUpdateDocument } from "@/hooks/update-document";
import { useGetDocuments } from "@/hooks/set-document";
import { useFormSchema } from "@/hooks/form-list";
import { useDocumentDetail } from "@/hooks/document-list";
import { useCompanyList } from "@/hooks/create-form";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useExportPDF } from "@/hooks/export-pdf";

type FormSubmission = {
    schema_id: string;
    answers: string;
    snapshot: string;
    due_date: string;
    iso_document?: string;
    priority: string;
};

function formatDocumentDate(value?: string) {
    if (!value) return "ไม่ระบุ";

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return "ไม่ระบุ";

    return new Intl.DateTimeFormat("th-TH", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Asia/Bangkok",
    }).format(parsedDate);
}

function getApprovalStepLabel(status?: string, decision?: string) {
    if (status === "PENDING") return "รออนุมัติ";
    if (status === "SKIPPED") return "ข้ามขั้นตอน";
    if (decision === "APPROVE") return "อนุมัติแล้ว";
    if (decision === "REJECT") return "ตีกลับเอกสาร";
    if (decision === "CANCEL") return "ยกเลิกเอกสาร";
    return "รอดำเนินการ";
}

function FormPageContent() {
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
    const useParams = useSearchParams();
    const schema_id = useParams.get('schema_id');
    const doc_id = useParams.get('doc_id');
    const doc_mode = useParams.get('mode');
    const router = useRouter();
    const [date, setDate] = useState<Date>();
    const { data: companyList } = useCompanyList();
    const [priorityState, setPriorityState] = useState("");
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [pendingDecision, setPendingDecision] = useState("");
    const [comment, setComment] = useState("");
    const [company, setCompany] = useState("");
    const [approver, setApprover] = useState([
        { name: "" }
    ]);

    const COMPANY_OPTIONS = companyList?.map((c: any) => ({ label: c.name as string, value: c.code as string })) ?? [];
    const ApproverLists = [
        { value: "2168160", label: "Approver 1" }, //2168160
        { value: "2153002", label: "Approver 2" }, //2153002
        { value: "2159001", label: "Approver 3" }, //2159001
        { value: "2254002", label: "Approver 4" }, //2254002
    ];
    const priority = [
        { value: "low", label: "น้อย" },
        { value: "medium", label: "ปานกลาง" },
        { value: "high", label: "สูง" },
    ]

    const { data, isLoading, error } = useFormSchema(schema_id || "");
    const { data: dataFromBackend } = useDocumentDetail(doc_id || "");
    const { data: currentUser, isPending: isCurrentUserPending } = useCurrentUser();
    const approveMutate = useApproveMutation();
    const createDocumentMutation = useCreateDocument();
    const updateDocumentMutation = useUpdateDocument();
    const exportPDFMutation = useExportPDF();
    const hasRedirectedForEditAccess = useRef(false);
    const isNewVersion = useMemo(() => {
        const currentRevision = dataFromBackend?.currentRevision;
        const currentSchemaVersionId = data?.schemaVersion?.[0]?.id;

        if ((dataFromBackend?.status !== "DRAFT" && dataFromBackend?.status !== "REJECTED") || !currentRevision?.formData || !currentSchemaVersionId) {
            return false;
        }

        const answersFromBackend = JSON.parse(currentRevision.formData);

        return answersFromBackend.schema_version_id !== currentSchemaVersionId;
    }, [data, dataFromBackend]);
    console.log(currentUser)
    const data_fields = useMemo(
        () =>
            data?.schemaVersion?.[0]?.fields?.map((item: any) => ({
                id: item.fields.id,
                type: item.fields.type,
                label: item.fields.label,
                placeholder: "",
                required: item.required,
                helpText: item.fields.helpText,
                width: item.width,
                option: typeof item.fields.option === "string"
                    ? JSON.parse(item.fields.option)
                    : item.fields.option
            })) ?? [],
        [data]
    );
    const isDocumentMode =
        doc_mode === "edit" || doc_mode === "view" || doc_mode === "approve";

    const fieldsFromSnapshot = useMemo(() => {
        if (!isDocumentMode || !dataFromBackend?.currentRevision?.snapshot) {
            return [];
        }

        return JSON.parse(dataFromBackend.currentRevision.snapshot);
    }, [dataFromBackend, isDocumentMode]);

    const fields = useMemo(
        () => {
            const sourceFields = fieldsFromSnapshot.length > 0 && !isNewVersion
                ? fieldsFromSnapshot
                : data_fields;

            return sourceFields.map((field: any) => {
                if (field.option) {
                    const { option, ...rest } = field;
                    return { ...rest, ...(option ?? {}) };
                }
                return field;
            });
        },
        [data_fields, fieldsFromSnapshot, isNewVersion]
    );

    useEffect(() => {
        if (!data) return;
        if (!fields.length) return;
        if (hasRedirectedForEditAccess.current) return;
        if (doc_mode === "edit") {
            if (!dataFromBackend || isCurrentUserPending) return;
            if (dataFromBackend.createdById !== currentUser?.user_info?.id) {
                hasRedirectedForEditAccess.current = true;
                toast.error("คุณไม่มีสิทธิ์แก้ไขเอกสารผู้อื่น");
                router.replace("/dashboard");
                return;
            }
        }

        if (doc_mode === "approve") {
            if (!dataFromBackend || isCurrentUserPending) return;
            const isApprover = dataFromBackend.currentRevision.workflowExecution.steps.find((doc: any) => doc.employee.firstName === currentUser?.user_info.firstName)
            if (!(isApprover && isApprover.status === "PENDING")) {
                hasRedirectedForEditAccess.current = true;
                toast.error("คุณไม่มีสิทธิ์อนุมัติเอกสารนี้หรือยังไม่ถึงขั้นตอนของคุณ");
                router.replace("/dashboard");
                return;
            }
        }

        const getDefaultValue = (field: any) => {
            if (field.type === "toggle") return false;
            if (field.type === "checkbox") return [];
            return "";
        };

        const values =
            fields.reduce(
                (acc: Record<string, any>, field: any) => {
                    acc[field.id] = getDefaultValue(field);
                    return acc;
                },
                {}
            );
        const currentFormValues = form.getValues() as Record<string, any>;
        const existingEmployeeField = currentFormValues.employee_field;

        form.reset({
            ...values,
            ...(existingEmployeeField
                ? { employee_field: existingEmployeeField }
                : {}),
        });
        // form.reset(values);

        if (!isDocumentMode || !doc_id || !dataFromBackend?.currentRevision) {
            return;
        }

        const { currentRevision } = dataFromBackend;
        const fieldsFromBackend = JSON.parse(currentRevision.snapshot);
        const answersFromBackend = JSON.parse(currentRevision.formData);

        const employeeField = fieldsFromBackend.find(
            (field: any) => field.type === "employee_detail"
        );

        const fileFields = fieldsFromBackend.filter((field: any) => field.type === "file");

        const result = { ...answersFromBackend };

        if (employeeField && employeeField.id in result) {
            result.employee_field = result[employeeField.id];
            delete result[employeeField.id];
        }

        fileFields.forEach((fileField: any) => {
            const fileValue = result[fileField.id];
            if (!fileValue) return;

            const attachments = Array.isArray(
                dataFromBackend.currentRevision.attachments
            )
                ? dataFromBackend.currentRevision.attachments
                : [];

            if (fileField.multiple) {
                result[fileField.id] = fileValue.map((file: any, index: number) => ({
                    ...file,
                    originalName:
                        attachments[index]?.originalFileName ??
                        file.name ??
                        "",
                    path:
                        attachments[index]?.path ??
                        file.path ??
                        "",
                }));
            } else {
                result[fileField.id] = {
                    ...result[fileField.id],
                    originalName:
                        attachments[0]?.originalFileName ??
                        "",
                    path:
                        attachments[0]?.path ??
                        "",
                }
            }
        });

        const values_snapshot =
            fieldsFromBackend.map((field: any) => field.id).reduce(
                (acc: any, id: any) => {
                    acc[id] = "";
                    return acc;
                },
                {} as Record<string, any>
            ) ?? {};

        form.reset(values_snapshot);

        const dataDeJSON = {
            fields: fieldsFromBackend,
            answers: result,
        };

        setDate(new Date(dataFromBackend.dueDate))
        setPriorityState(dataFromBackend.priority ?? "");
        setCompany(dataFromBackend?.currentRevision?.company?.code ?? "")
        form.reset(dataDeJSON.answers);
    }, [
        currentUser,
        data,
        dataFromBackend,
        doc_id,
        doc_mode,
        fields,
        form,
        hasRedirectedForEditAccess,
        isCurrentUserPending,
        router,
    ]);

    useEffect(() => {
        if (doc_mode === "create" && doc_id) {
            router.replace("/dashboard");
        }
    }, [doc_id, doc_mode, router]);

    useEffect(() => {
        if (error) {
            toast.error("ไม่สามารถดึงฟิลด์เอกสารได้");
            router.push("/document_list");
        }
    }, [error, router]);

    if (isLoading) {
        return <Loading />
    }

    if (error) {
        return null;
    }

    function validateData(data: Record<string, any>): boolean {
        const errors: string[] = [];

        const isEmpty = (value: any): boolean => {
            if (value === undefined || value === null) return true;

            if (typeof value === "string") {
                return value.trim() === "";
            }

            if (Array.isArray(value)) {
                return value.length === 0;
            }

            if (value instanceof FileList) {
                return value.length === 0;
            }

            if (value instanceof File) {
                return false;
            }

            if (typeof value === "object") {
                return Object.keys(value).length === 0;
            }

            return false;
        };

        fields.forEach((field: any) => {
            if (!field.required) return;

            const value =
                field.type === "employee_detail"
                    ? data.employee_field
                    : data[field.id];

            if (field.type === "employee_detail") {
                if (
                    !value ||
                    !value.employee_code ||
                    !value.first_name
                ) {
                    errors.push(`${field.label} จำเป็นต้องกรอก`);
                }

                return;
            }

            if (isEmpty(value)) {
                errors.push(`${field.label} จำเป็นต้องกรอก`);
                return;
            }

            if (
                field.type === "phone" &&
                !/^0\d{9}$/.test(String(value))
            ) {
                errors.push(`${field.label} ต้องเป็นเบอร์โทรศัพท์ 10 หลัก`);
            }
        });

        if (!priorityState) {
            errors.push("ยังไม่ได้เลือกระดับความสำคัญ");
        }

        if (!date) {
            errors.push("ยังไม่ได้กรอกวันที่สิ้นสุดเอกสาร");
        }

        if (!company) {
            errors.push("ยังไม่ได้เลือกบริษัทที่ดำเนินการ");
        }

        errors.forEach((error) => toast.error(error));

        return errors.length === 0;
    }

    function cleanAnswerData(obj: Record<string, any>) {
        const result: Record<string, any> = {};

        Object.entries(obj).forEach(([key, value]) => {
            if (value instanceof File) {
                result[key] = {
                    name: value.name,
                    size: value.size,
                    type: value.type,
                    lastModified: value.lastModified,
                };
                return;
            }

            if (Array.isArray(value)) {
                result[key] = value
                    .map((item) => {
                        if (item instanceof File) {
                            return {
                                name: item.name,
                                size: item.size,
                                type: item.type,
                                lastModified: item.lastModified,
                            };
                        }

                        return item;
                    })
                    .filter((item) => item !== null && item !== undefined);

                return;
            }

            if (value && typeof value === "object" && Object.keys(value).length > 0) {
                result[key] = value;
                return;
            }

            if (value !== null && value !== undefined && value !== "") {
                result[key] = value;
            }
        });

        return result;
    }

    const onSubmit = (formdata: Record<string, any>, decision: string) => {
        const { employee_field } = formdata;
        if (doc_mode === "approve") {
            if (!dataFromBackend) {
                toast.error("ข้อมูลเอกสารยังไม่พร้อม");
                return;
            }

            if (!decision) {
                toast.error("ไม่พบการตัดสินใจ");
                return;
            }

            if (decision === "APPROVE") {
                approveMutate.mutate({
                    document_code: dataFromBackend.documentNo,
                    decision: decision,
                    comment: "",
                });
            } else {
                setPendingDecision(decision);
                setComment("");
                setCommentModalOpen(true);
            }

        } else if (doc_mode === "create" || doc_mode === "edit") {
            if (!validateData(formdata)) return;

            const employeeField = fields.find((field: any) => field.type === "employee_detail");
            if (employeeField && employee_field) {
                formdata[employeeField.id] = formdata.employee_field;
                delete formdata.employee_field;
            }

            formdata.schema_version_id = data.schemaVersion[0].id
            const formDataPayload = new FormData();
            const is_publish = decision === "draft" ? false : true
            formDataPayload.append("schema_id", data.id);
            formDataPayload.append("snapshot", JSON.stringify(fields));
            formDataPayload.append("answers", JSON.stringify(cleanAnswerData(formdata)));
            formDataPayload.append("due_date", date ? date.toISOString() : "");
            formDataPayload.append("priority", priorityState);
            formDataPayload.append("is_publish", String(is_publish));
            formDataPayload.append("company_code", company);

            // add actual file field(s)
            Object.entries(formdata).forEach(([key, value]) => {
                if (value instanceof File) {
                    formDataPayload.append('files', value);
                } else if (Array.isArray(value) && value.every((v) => v instanceof File)) {
                    value.forEach((file) => formDataPayload.append('files', file));
                }
            });

            if (doc_mode === "edit") {
                formDataPayload.append("document_code", doc_id ?? "");
                updateDocumentMutation.mutate(formDataPayload as any);
                return;
            }

            createDocumentMutation.mutate(formDataPayload as any);

        }

    };

    const handleRemoveApprover = (index: number) => {
        setApprover(
            approver.filter((_, i) => i !== index)
        );
    };

    const handleAddApprover = () => {
        setApprover([
            ...approver,
            { name: "" }
        ]);
    };

    const availableOptions = ApproverLists.filter(
        option =>
            !approver.some(app => app.name === option.value)
    );

    function changePage(route: string) {
        router.push(route)
    }

    function submitApproval() {
        if (!dataFromBackend || !pendingDecision) return;

        approveMutate.mutate({
            document_code: dataFromBackend.documentNo,
            decision: pendingDecision,
            comment,
        });
        setCommentModalOpen(false);
    }

    function commentModal({ onClose }: { onClose: () => void }) {
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
                    <div className="flex items-center justify-between border-b p-5">
                        <h2 className="text-xl font-semibold">
                            {pendingDecision === "REJECT" ? "ส่งเอกสารกลับเพื่อแก้ไข" : "ยกเลิกเอกสาร"}
                        </h2>
                        <button type="button" onClick={onClose} className="text-2xl leading-none" aria-label="ปิด">
                            &times;
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 p-5">
                        <label htmlFor="approval-comment" className="font-medium">ความคิดเห็นหรือเหตุผล (ไม่บังคับ)</label>
                        <textarea
                            id="approval-comment"
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                            placeholder="ระบุรายละเอียดเพิ่มเติมให้ผู้เกี่ยวข้องทราบ"
                            rows={5}
                            className="w-full resize-y rounded-md border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-2 border-t p-5">
                        <button type="button" onClick={onClose} className="rounded-md bg-gray-200 px-4 py-2">
                            ยกเลิก
                        </button>
                        <button
                            type="button"
                            onClick={submitApproval}
                            disabled={approveMutate.isPending}
                            className="rounded-md bg-[#4A4DF1] px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {approveMutate.isPending
                                ? "กำลังส่ง..."
                                : pendingDecision === "REJECT"
                                    ? "ยืนยันการส่งกลับ"
                                    : "ยืนยันการยกเลิก"}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <form
            onSubmit={handleSubmit((formdata, event) => {
                const submitter = (event?.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
                onSubmit(formdata, submitter?.value ?? "");
            })}
            className="bg-slate-50 min-h-screen h-full w-full p-6"
        >
            {(doc_mode == "view" || doc_mode == "approve") && (
                <div className="mb-4 flex items-center gap-4">
                    <Link href={`${doc_mode === "approve" ? '/approve' : '/dashboard'}`} accessKey="it01">
                        <span className="flex size-10 items-center justify-center rounded-md bg-[#1b1b1b] text-white transition hover:bg-slate-700">
                            <ArrowLeft className="size-5" />
                        </span>
                    </Link>
                    <div className="">
                        <h1 className="text-lg font-bold">{doc_mode === "approve" ? "กลับไปงานรออนุมัติ" : "กลับไปหน้า Dashboard"}</h1>
                        <span className="text-sm text-slate-500">{doc_mode === "approve" ? "กลับไปยังรายการเอกสารที่รอการพิจารณา" : "กลับไปดูภาพรวมเอกสาร"}</span>
                    </div>
                </div>
            )}
            {(doc_mode === "view" || doc_mode === "approve") && dataFromBackend && (
                <section className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-indigo-600">
                                {doc_mode === "approve" ? "กำลังพิจารณาเอกสาร" : "รายละเอียดเอกสาร"}
                            </p>
                            <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                                {data?.name ?? "เอกสาร"}
                            </h1>
                            <p className="mt-1 text-sm text-slate-600">
                                เลขที่เอกสาร <span className="font-semibold text-slate-900">{doc_id}</span>
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={dataFromBackend.status} />
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                                {doc_mode === "approve" ? "โหมดพิจารณา" : "โหมดดูเอกสาร"}
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 px-5 py-4 text-sm sm:grid-cols-3 xl:grid-cols-5">
                        <div>
                            <p className="text-slate-500">ผู้สร้าง</p>
                            <p className="mt-1 font-medium text-slate-900">
                                {dataFromBackend.createdBy?.firstName ?? "ไม่ระบุ"}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-500">แผนก</p>
                            <p className="mt-1 font-medium text-slate-900">
                                {data?.division?.name ?? "ไม่ระบุ"}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-500">บริษัท</p>
                            <p className="mt-1 font-medium text-slate-900">
                                {COMPANY_OPTIONS.find((option) => option.value === dataFromBackend.currentRevision?.company?.code)?.label
                                    ?? dataFromBackend.currentRevision?.company?.code
                                    ?? "ไม่ระบุ"}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-500">ระดับความสำคัญ</p>
                            <p className="mt-1 font-medium text-slate-900">
                                {priority.find((item) => item.value === dataFromBackend.priority)?.label ?? "ไม่ระบุ"}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-500">วันครบกำหนด</p>
                            <p className="mt-1 font-medium text-slate-900">
                                {formatDocumentDate(dataFromBackend.dueDate)}
                            </p>
                        </div>
                    </div>
                    {doc_mode === "approve" && (
                        <div className="border-t border-indigo-100 bg-indigo-50 px-5 py-3 text-sm text-indigo-900">
                            ตรวจสอบรายละเอียดและข้อมูลในเอกสารก่อนเลือกอนุมัติ ส่งกลับเพื่อแก้ไข หรือยกเลิกเอกสาร
                        </div>
                    )}
                </section>
            )}
            <div className="bg-white border rounded-xl px-5 py-4 shadow w-full" style={{ scrollbarWidth: "none" }}>
                <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">
                        <span>{data?.name}</span>
                        {(doc_mode != "create" && doc_id) && (
                            <>
                                <span className="font-light">{" เลขที่เอกสาร "}</span>
                                <span className="font-bold">{doc_id}</span>
                            </>
                        )}
                    </div>
                    {doc_mode === "view" && doc_id && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                disabled={exportPDFMutation.isPending}
                                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                onClick={() => exportPDFMutation.mutate({ code: doc_id, disposition: "inline" })}
                            >
                                {"Preview"}
                            </Button>
                            <Button
                                variant="default"
                                type="button"
                                disabled={exportPDFMutation.isPending}
                                className="bg-indigo-600 text-white hover:bg-indigo-700"
                                onClick={() => exportPDFMutation.mutate({ code: doc_id, disposition: "attachment" })}
                            >
                                {"Export PDF"}
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <div className={`flex justify-between w-full gap-8 ${doc_mode === 'create' || doc_mode === 'edit' ? '' : "hidden"}`}>
                        <div className="gap-2 w-full">
                            <div>
                                <span>
                                    {"วันครบกำหนดเอกสาร (Due date)"}
                                </span>
                                <span className="text-red-500">{" *"}</span>
                            </div>
                            <Popover>
                                <PopoverTrigger render={
                                    <Button
                                        variant={"outline"}
                                        data-empty={!date}
                                        disabled={doc_mode === "view" || doc_mode === "approve"}
                                        className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                                    >
                                        {date ?
                                            new Intl.DateTimeFormat("th-TH", { dateStyle: "long", }).format(date)
                                            :
                                            <span>{"เลือกวันที่"}</span>
                                        }
                                        <ChevronDownIcon data-icon="inline-end" /></Button>} />
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        defaultMonth={date}
                                        locale={th}
                                        disabled={[
                                            { before: startOfDay(new Date()) },
                                            ...(doc_mode === "view" || doc_mode === "approve" ? [() => true] : []),
                                        ]}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="w-full">
                            <div className="w-full">
                                <div className="w-full flex">
                                    <span>{"ระดับความสำคัญ"}</span>
                                    <span className="text-red-500">{" *"}</span>
                                </div>
                                <div className="w-full flex">
                                    <Select
                                        isDisabled={doc_mode === "view" || doc_mode === "approve"}
                                        value={priority.find((op) => op.value === priorityState) || null}
                                        name="priority"
                                        id="priority"
                                        options={priority}
                                        className="w-full"
                                        onChange={(op) => setPriorityState(op?.value ?? "")}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="w-full">
                            <div className="w-full">
                                <div className="w-full flex">
                                    <span>{"บริษัทที่ดำเนินการ"}</span>
                                    <span className="text-red-500">{" *"}</span>
                                </div>
                                <div className="w-full flex">
                                    <Select
                                        isDisabled={doc_mode === "view" || doc_mode === "approve"}
                                        value={COMPANY_OPTIONS.filter((com: any) => com.value === company)}
                                        name="company"
                                        id="company"
                                        options={COMPANY_OPTIONS}
                                        className="w-full"
                                        onChange={(op: any) => setCompany(op.value ?? "")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    {(doc_mode === "create" || isNewVersion ? fields : fieldsFromSnapshot).map((f: any) => (
                        <div
                            key={f.id}
                            className="flex flex-col gap-1.5"
                            style={{ gridColumn: f.width === "full" ? "1 / -1" : undefined }}
                        >
                            <label style={{ fontSize: "1rem", fontWeight: 500, color: "var(--foreground)" }}>
                                {f.label}
                                {f.required && <span style={{ color: "var(--destructive)", marginLeft: "0.25rem" }}>*</span>}
                            </label>
                            <FieldPreview field={f as FormField} control={form.control as Control} setValue={setValue} getValues={getValues} mode={doc_mode === "approve" || doc_mode === "view" ? "view" : doc_mode ?? "edit"} />
                            {f.helpText && (
                                <p style={{ fontSize: "1rem", color: "var(--muted-foreground)" }}>{f.helpText}</p>
                            )}
                        </div>
                    ))}
                </div>
                {doc_mode == "create" || doc_mode == "edit" ? (
                    <div>
                        {fields.length > 0 && (
                            <div className="flex justify-end pt-2 mt-2">
                                <div className="flex gap-2">
                                    <button onClick={() => changePage("/dashboard")}
                                        type="button"
                                        className="px-5 py-2.5 rounded-lg bg-red-500 hover:cursor-pointer"
                                        style={{ color: "var(--primary-foreground)", fontSize: "1rem", fontWeight: 500 }}
                                    >
                                        {"ยกเลิก"}
                                    </button>
                                    <button
                                        type="submit"
                                        value={"draft"}
                                        className="px-5 py-2.5 rounded-lg hover:cursor-pointer bg-[#979797]"
                                        style={{ color: "var(--primary-foreground)", fontSize: "1rem", fontWeight: 500 }}
                                    >
                                        {"บันทึกแบบร่าง"}
                                    </button>
                                    <button
                                        type="submit"
                                        value={"submit"}
                                        className="px-5 py-2.5 rounded-lg hover:cursor-pointer"
                                        style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: "1rem", fontWeight: 500 }}
                                    >
                                        {"บันทึก"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : doc_mode == "approve" ?
                    (<div className="z-10 mt-6 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-600">
                                เลือกการดำเนินการสำหรับเอกสารนี้
                            </p>
                            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                <button
                                    className="rounded-md bg-slate-800 px-4 py-2.5 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    type="submit"
                                    value="REJECT"
                                    disabled={approveMutate.isPending}
                                >
                                    ส่งกลับเพื่อแก้ไข
                                </button>
                                <button
                                    className="rounded-md bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    type="submit"
                                    value="CANCEL"
                                    disabled={approveMutate.isPending}
                                >
                                    ยกเลิกเอกสาร
                                </button>
                                <button
                                    className="rounded-md bg-[#4A4DF1] px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    type="submit"
                                    value="APPROVE"
                                    disabled={approveMutate.isPending}
                                >
                                    {approveMutate.isPending ? "กำลังส่ง..." : "อนุมัติเอกสาร"}
                                </button>
                            </div>
                        </div>
                    </div>) :
                    (<div></div>)
                }
            </div>
            {commentModalOpen && commentModal({ onClose: () => setCommentModalOpen(false) })}
            {(doc_mode === "view" || doc_mode === "approve") && (
                <section className="mt-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">ประวัติการอนุมัติ</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {doc_mode === "approve"
                                    ? "ดูความคืบหน้าของผู้อนุมัติในลำดับต่าง ๆ ก่อนตัดสินใจ"
                                    : "ตรวจสอบผู้อนุมัติและผลการดำเนินการในแต่ละลำดับ"}
                            </p>
                        </div>
                    </div>
                    {dataFromBackend?.currentRevision?.workflowExecution?.steps?.length ? (
                        <ol className="mt-5 space-y-3">
                            {dataFromBackend.currentRevision.workflowExecution.steps.map((step: any, index: number) => {
                                const approved = step.decision === "APPROVE";
                                const rejected = step.decision === "REJECT";
                                const cancelled = step.decision === "CANCEL";
                                const skipped = step.status === "SKIPPED"
                                const completed = approved || rejected || cancelled || skipped;
                                const colorClass = approved
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : rejected
                                        ? "border-slate-300 bg-slate-100 text-slate-800"
                                        : cancelled
                                            ? "border-red-200 bg-red-50 text-red-800"
                                            : step.status === "PENDING"
                                                ? "border-indigo-200 bg-indigo-50 text-indigo-800"
                                                : step.status === "SKIPPED"
                                                    ? "border-yellow-200 bg-yellow-50 text-yellow-800"
                                                    : "border-slate-200 bg-white text-slate-700";

                                return (
                                    <li key={`${step.level}-${step.employee?.id ?? index}`} className={`rounded-lg border p-4 ${colorClass}`}>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-start gap-3">
                                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-sm font-bold">
                                                    {step.level ?? index + 1}
                                                </span>
                                                <div>
                                                    <p className="font-semibold">
                                                        {step.employee?.firstName ?? "ไม่ระบุผู้อนุมัติ"}
                                                    </p>
                                                    <p className="mt-0.5 text-sm">{getApprovalStepLabel(step.status, step.decision)}</p>
                                                </div>
                                            </div>
                                            <div className="pl-11 text-sm sm:pl-0 sm:text-right">
                                                {completed && step.actedAt && (
                                                    <p>{formatDocumentDate(step.actedAt)}</p>
                                                )}
                                                {step.comment && <p className="mt-1 whitespace-pre-wrap">{step.comment}</p>}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    ) : (
                        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                            ยังไม่มีข้อมูลประวัติการอนุมัติ
                        </p>
                    )}
                </section>
            )}
        </form>
    )
}

export default function Page() {
    return (
        <Suspense fallback={<Loading />}>
            <FormPageContent />
        </Suspense>
    );
}