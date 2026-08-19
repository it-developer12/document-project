'use client'
import { useForm, SubmitHandler, Control, Controller } from "react-hook-form"
import Image from 'next/image'
import { FieldPreview } from "@/app/component/FormRender";
import { ArrowLeft, ChevronDownIcon, CircleCheck } from "lucide-react"
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
import { useGetDocuments } from "@/hooks/set-document";
import { useFormSchema } from "@/hooks/form-list";
import { useDocumentDetail } from "@/hooks/document-list";

type FormSubmission = {
    schema_id: string;
    answers: string;
    snapshot: string;
    due_date: string;
    iso_document?: string;
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
    const [approver, setApprover] = useState([
        { name: "" }
    ]);
    const ApproverLists = [
        { value: "2168160", label: "Approver 1" }, //2168160
        { value: "2153002", label: "Approver 2" }, //2153002
        { value: "2159001", label: "Approver 3" }, //2159001
        { value: "2254002", label: "Approver 4" }, //2254002
    ];

    const { data, isLoading, error } = useFormSchema(schema_id || "");
    const { data: dataFromBackend } = useDocumentDetail(doc_id || "");
    const approveMutate = approveMutation();
    const createDocumentMutation = useCreateDocument();

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

    const fields = useMemo(
        () =>
            data_fields.map((field: any) => {
                if (field.option) {
                    const { option, ...rest } = field;
                    return { ...rest, ...(option ?? {}) };
                }
                return field;
            }),
        [data_fields]
    );

    useEffect(() => {
        if (!fields.length) return;

        const values =
            fields.map((field: any) => field.id).reduce(
                (acc: any, id: any) => {
                    acc[id] = "";
                    return acc;
                },
                {} as Record<string, any>
            ) ?? {};
        form.reset(values);

        const isDocumentMode = doc_mode === "edit" || doc_mode === "view" || doc_mode === "approve";
        if (!isDocumentMode || !doc_id || !dataFromBackend?.currentRevision) {
            return;
        }

        const { currentRevision } = dataFromBackend;
        const fieldsFromBackend = JSON.parse(currentRevision.snapshot);
        const answersFromBackend = JSON.parse(currentRevision.formData);

        const employeeField = fields.find(
            (field: any) => field.type === "employee_detail"
        );

        const result = { ...answersFromBackend };

        if (employeeField && employeeField.id in result) {
            result.employee_field = result[employeeField.id];
            delete result[employeeField.id];
        }

        const dataDeJSON = {
            fields: fieldsFromBackend,
            answers: result,
        };

        setDate(new Date(dataFromBackend.dueDate))

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

    function validateData(data: any) {
        const errors: string[] = [];

        fields.map((field: any) => {
            if (field.required && field.type != "employee_detail") {
                const fieldValue = data[field.id];
                // Check if field is empty
                if (
                    fieldValue === undefined ||
                    fieldValue === null ||
                    fieldValue === "" ||
                    (Array.isArray(fieldValue) && fieldValue.length === 0) ||
                    (typeof fieldValue === "object" && Object.keys(fieldValue).length === 0)
                ) {
                    errors.push(`${field.label} จำเป็นต้องกรอก`);

                }
            } else if (field.type == "employee_detail" && field.required) {
                const fieldValue = data["employee_field"]
                if (fieldValue.employee_code.trim() === "" || fieldValue.first_name === "") {
                    errors.push(`${field.label} จำเป็นต้องกรอก`);
                }
            }
        });

        if (errors.length > 0) {
            errors.map(error => toast.error(error));
            return false;
        }

        return true;
    }

    const onSubmit = (formdata: Record<string, any>) => {
        const { employee_field } = formdata;
        if (doc_mode === "approve") {
            if (!dataFromBackend) {
                toast.error("ข้อมูลเอกสารยังไม่พร้อม");
                return;
            }

            approveMutate.mutate({
                document_code: dataFromBackend.documentNo,
                decision: "APPROVE",
                comment: ""
            });

            if (approveMutate.isSuccess) {
                toast.success("อนุมัติเอกสารสำเร็จ");
                router.push("/approve");
            }
        } else if (doc_mode === "create") {
            // Validate required fields

            if (!validateData(formdata)) {
                return;
            }

            const employeeField = fields.find(
                (field: any) => field.type === "employee_detail" // or "employee_field"
            );

            if (employeeField && employee_field) {
                formdata[employeeField.id] = formdata.employee_field;
                delete formdata.employee_field;
            }
            const JSONfields = JSON.stringify(fields);
            const JSONdata = JSON.stringify(formdata);
            const payload: FormSubmission = {
                schema_id: data.id,
                answers: JSONdata,
                snapshot: JSONfields,
                due_date: date ? date.toISOString() : "",
                iso_document: "", // Add this line to include the iso_document field
            };

            createDocumentMutation.mutate(payload);

            router.push('/dashboard')
            toast.success("สร้างเอกสารสำเร็จ")
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-50 min-h-screen h-full w-full p-6">
            {doc_mode == "view" || doc_mode == "approve" && (
                <div className='flex items-center gap-4 mb-4'>
                    <Link href={`${doc_mode === "approve" ? '/approve' : '/dashboard'}`} accessKey="it01">
                        <div className='text-white p-2 bg-[#1b1b1b] rounded-md flex justify-between items-center'>
                            <span className='text-lg'><ArrowLeft /></span>
                        </div>
                    </Link>
                    <div className="">
                        <h1 className="text-2xl font-bold">{"ย้อนกลับ"}</h1>
                        <span>{"Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."}</span>
                    </div>
                </div>
            )}
            <div className="bg-white border rounded-xl px-5 py-4 shadow w-full" style={{ scrollbarWidth: "none" }}>
                <div className="text-2xl font-bold">
                    <span>{data?.name}</span>
                </div>
                <div className="mt-4">
                    <div className="">
                        <div className="font-semibold">
                            <span>{"ISO ref. "}</span>
                        </div>
                        <div>
                            <input type="text" className="w-1/4 p-1.5 pl-2 py-2 border rounded bg-[#F3F4F8] text-sm" placeholder="iso ref."
                                disabled={doc_mode == "view" || doc_mode == "approve"}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2 items-center">
                        <span>
                            {"วันที่สิ้นสุดเอกสาร"}
                        </span>
                        <Popover>
                            <PopoverTrigger render={
                                <Button variant={"outline"} data-empty={!date} className="w-53 justify-between text-left font-normal data-[empty=true]:text-muted-foreground">
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
                    {fields.map((f: any) => (
                        <div
                            key={f.id}
                            className="flex flex-col gap-1.5"
                            style={{ gridColumn: f.width === "full" ? "1 / -1" : undefined }}
                        >
                            <label style={{ fontSize: "1rem", fontWeight: 500, color: "var(--foreground)" }}>
                                {f.label}
                                {f.required && <span style={{ color: "var(--destructive)", marginLeft: "0.25rem" }}>*</span>}
                            </label>
                            <FieldPreview field={f as FormField} control={form.control as Control} setValue={setValue} getValues={getValues} mode={doc_mode == "view" || doc_mode === "approve" ? "view" : "edit"} />
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
                            <button className="text-white bg-black px-4 py-2 rounded-md hover:cursor-pointer" onClick={() => changePage("/reject")}>{"ตีกลับ"}</button>
                            <button className="text-white bg-red-500 px-4 py-2 rounded-md hover:cursor-pointer" onClick={() => changePage("/reject")}>{"ยกเลิก"}</button>
                            <button className="text-white bg-[#4A4DF1] px-4 py-2 rounded-md hover:cursor-pointer" type="submit">{"อนุญาติ"}</button>
                        </div>
                    </div>) :
                    (<div></div>)
                }
            </div>
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