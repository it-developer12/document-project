'use client'
import { useForm, SubmitHandler, Control, Controller } from "react-hook-form"
import Image from 'next/image'
import { FieldPreview } from "@/app/component/FormRender";
import { ArrowLeft, ChevronDownIcon, CircleCheck, MoveRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Suspense, useEffect, useMemo, useState } from "react";
import Select from 'react-select'
import { useRouter, useSearchParams } from "next/navigation";
import { startOfDay, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import Signature from "@/public/example_sign.png"
import { toast } from "react-toastify";
import Loading from "@/app/component/loading";
import { approveMutation } from "@/hooks/approve-document";
import { useCreateDocument } from "@/hooks/create-document";
import { useUpdateDocument } from "@/hooks/update-document";
import { useGetDocuments } from "@/hooks/set-document";
import { useFormSchema } from "@/hooks/form-list";
import { useDocumentDetail } from "@/hooks/document-list";
import { useCompanyList } from "@/hooks/create-form";

type FormSubmission = {
    schema_id: string;
    answers: string;
    snapshot: string;
    due_date: string;
    iso_document?: string;
    priority: string;
};

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
    const approveMutate = approveMutation();
    const createDocumentMutation = useCreateDocument();
    const updateDocumentMutation = useUpdateDocument();
    const isNewVersion = useMemo(() => {
        const currentRevision = dataFromBackend?.currentRevision;
        const currentSchemaVersionId = data?.schemaVersion?.[0]?.id;

        if (dataFromBackend?.status !== "DRAFT" || !currentRevision?.formData || !currentSchemaVersionId) {
            return false;
        }

        const answersFromBackend = JSON.parse(currentRevision.formData);
        return answersFromBackend.schema_version_id !== currentSchemaVersionId;
    }, [data, dataFromBackend]);

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
    }, [doc_id, doc_mode, dataFromBackend, fields, form]);

    if (isLoading) {
        return <Loading />
    }

    if (doc_mode === "create" && doc_id) {
        router.push('dashboard')
        toast.error('')
    }

    if (error) {
        toast.error("ไม่สามารถดึงฟิลด์เอกสารได้");
        router.push("/document_list");
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
            console.log(decision)
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
                        <h2 className="text-xl font-semibold">เหตุผลในการตีกลับหรือยกเลิกเอกสาร</h2>
                        <button type="button" onClick={onClose} className="text-2xl leading-none" aria-label="ปิด">
                            &times;
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 p-5">
                        <label htmlFor="approval-comment" className="font-medium">เหตุผล</label>
                        <textarea
                            id="approval-comment"
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                            placeholder="กรอกความคิดเห็น"
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
                            {approveMutate.isPending ? "กำลังส่ง..." : "ยืนยัน"}
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
                <div className='flex items-center gap-4 mb-4'>
                    <Link href={`${doc_mode === "approve" ? '/approve' : '/dashboard'}`} accessKey="it01">
                        <div className='text-white p-2 bg-[#1b1b1b] rounded-md flex justify-between items-center'>
                            <span className='text-lg'><ArrowLeft /></span>
                        </div>
                    </Link>
                    <div className="">
                        <h1 className="text-2xl font-bold">{"ย้อนกลับ"}</h1>
                        <span>{"ย้อนกลับไปหน้า Dashboard"}</span>
                    </div>
                </div>
            )}
            <div className="bg-white border rounded-xl px-5 py-4 shadow w-full" style={{ scrollbarWidth: "none" }}>
                <div className="text-2xl font-bold">
                    <span>{data?.name}</span>
                    {(doc_mode != "create" && doc_id) && (
                        <>
                            <span className="font-light">{" เลขที่เอกสาร "}</span>
                            <span className="font-bold">{doc_id}</span>
                        </>
                    )}
                </div>
                <div className="mt-4">
                    <div className="flex justify-between w-full gap-8">
                        <div className="gap-2 w-full">
                            <div>
                                <span>
                                    {"วันครบกำหนดเอกสาร (Due date)"}
                                </span>
                                <span className="text-red-500">{" *"}</span>
                            </div>
                            <Popover>
                                <PopoverTrigger render={
                                    <Button variant={"outline"} data-empty={!date} className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground">
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
                                        onChange={(op) => setCompany(op.value ?? "")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {data.approvalSource != "TEMPLATE" ? approver.map((app, index) => (
                        <div
                            key={index}
                            className={`flex items-center mt-2 gap-2`}
                        >
                            <div className="flex gap-2 items-center">
                                <span>
                                    ผู้อนุมัติ คนที่ {index + 1}
                                </span>
                            </div>
                            <Select
                                key={index}
                                defaultInputValue=""
                                placeholder="โปรดเลือกผู้อนุญาติเอกสาร"
                                className="w-1/4 rounded-lg"
                                options={[{ value: "", label: "โปรดเลือกผู้อนุญาติเอกสาร" }, ...availableOptions]}
                                value={ApproverLists.find(
                                    option => option.value === app.name
                                )}
                                onChange={(selected) => {
                                    if (!selected) return;

                                    const newApprover = [...approver];
                                    newApprover[index].name = selected?.value || "";
                                    setApprover(newApprover);
                                }}
                                isDisabled={doc_mode == "view" || doc_mode === "approve"}
                            />
                            {index === approver.length - 1 && (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleAddApprover}
                                        className="bg-green-400 text-white px-2 py-0.5 rounded-md hover:cursor-pointer"
                                    >
                                        เพิ่ม
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveApprover(index)}
                                        className={`bg-red-400 text-white px-2 py-0.5 rounded-md ${index === 0 ? 'hidden' : ''}`}
                                    >
                                        ลบ
                                    </button>
                                </div>
                            )}
                        </div>
                    )) : <div></div>}
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
                    (<div className="mt-10">
                        <div className="flex gap-4 justify-end">
                            <button className="text-white bg-black px-4 py-2 rounded-md hover:cursor-pointer" type="submit" value="REJECT">{"ตีกลับ"}</button>
                            <button className="text-white bg-red-500 px-4 py-2 rounded-md hover:cursor-pointer" type="submit" value="CANCEL">{"ยกเลิก"}</button>
                            <button className="text-white bg-[#4A4DF1] px-4 py-2 rounded-md hover:cursor-pointer" type="submit" value="APPROVE">{"อนุญาติ"}</button>
                        </div>
                    </div>) :
                    (<div></div>)
                }
            </div>
            {commentModalOpen && commentModal({ onClose: () => setCommentModalOpen(false) })}
            {doc_mode == "approve" && (
                <div className="bg-white border rounded-xl px-5 py-4 shadow w-full mt-4" style={{ scrollbarWidth: "none" }}>
                    <h1 className="text-2xl font-bold">
                        {"ผู้ที่อนุมัติแล้ว"}
                    </h1>
                    <div className="mt-4 flex gap-6">
                        {/* {isApproved.map((app: any, index: number) => (
                            <Card key={index} size="sm" className="w-full max-w-1/3 bg-green-500 text-white shadow transition-all duration-300 ease-out hover:scale-105">
                                <CardHeader className="flex justify-between items-center">
                                    <CardTitle className="text-xl font-semibold">{app.approvers[0].name}</CardTitle>
                                    <div className="flex gap-2 items-center">
                                        <CircleCheck />
                                        <span>{"อนุมัติแล้ว"}</span>
                                    </div>
                                </CardHeader>
                                {(index + 1) % 2 == 0 ? (
                                    <CardContent>
                                        <div className="p-4 w-full h-36 bg-white rounded">
                                            <Image src={Signature} alt={"example_signature"} className="w-full h-full object-contain" />
                                        </div>
                                    </CardContent>
                                ) : (
                                    <CardContent>
                                    </CardContent>
                                )}
                            </Card>
                        ))} */}
                    </div>
                </div>
            )}
            {(doc_mode == "view") && (
                <div className="bg-white border rounded-xl px-5 py-4 shadow w-full mt-4">
                    <div>
                        <span className="font-bold text-xl">{"สายอนุมัติของเอกสาร"}</span>
                    </div>
                    <div className="flex space-x-4 mt-4">
                        {dataFromBackend?.currentRevision?.workflowExecution?.steps.map((app: any, index: number) => {
                            return (
                                <div key={index} className="flex items-center space-x-2">
                                    <div className="space-x-2 bg-[#fef3c7] rounded-2xl px-2 py-1">
                                        <span>{`ลำดับที่ ` + app.level}</span>
                                        <span>{app.employee.firstName}</span>
                                    </div>
                                    <div className="">
                                        <div className={`${index != dataFromBackend?.currentRevision?.workflowExecution?.steps.length - 1 && dataFromBackend?.currentRevision?.workflowExecution?.steps.length > 1 ? "" : "hidden"}`}>
                                            <MoveRight className=""/>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
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