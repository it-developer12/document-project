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
import { useUpdateDocument } from "@/hooks/update-document";
import { useGetDocuments } from "@/hooks/set-document";
import { useFormSchema } from "@/hooks/form-list";
import { useDocumentDetail } from "@/hooks/document-list";

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
    const [priorityState, setPriorityState] = useState("");
    const [approver, setApprover] = useState([
        { name: "" }
    ]);
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
        () =>
            (fieldsFromSnapshot.length > 0 ? fieldsFromSnapshot : data_fields).map((field: any) => {
                if (field.option) {
                    const { option, ...rest } = field;
                    return { ...rest, ...(option ?? {}) };
                }
                return field;
            }),
        [data_fields, fieldsFromSnapshot]
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

            if (Array.isArray(fileValue) && Array.isArray(dataFromBackend.currentRevision.attachments)) {
                result[fileField.id] = fileValue.map((file: any, index: number) => ({
                    ...file,
                    originalName:
                        dataFromBackend.currentRevision.attachments[index]?.originalFileName ??
                        file.name ??
                        "",
                    path:
                        dataFromBackend.currentRevision.attachments[index]?.path ??
                        file.path ??
                        "",
                }));
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

        if (priorityState === "") {
            errors.push(`ยังไม่ได้เลือกระดับความสำคัญ`)
        }

        if (errors.length > 0) {
            errors.map(error => toast.error(error));
            return false;
        }

        return true;
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

                        if (item && typeof item === "object" && Object.keys(item).length > 0) {
                            return item;
                        }

                        return null;
                    })
                    .filter(Boolean);

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

            approveMutate.mutate({
                document_code: dataFromBackend.documentNo,
                decision,
                comment: ""
            });

            if (approveMutate.isSuccess) {
                toast.success("อนุมัติเอกสารสำเร็จ");
                router.push("/approve");
            }
        } else if (doc_mode === "create" || doc_mode === "edit") {
            if (!validateData(formdata)) return;

            const employeeField = fields.find((field: any) => field.type === "employee_detail");
            if (employeeField && employee_field) {
                formdata[employeeField.id] = formdata.employee_field;
                delete formdata.employee_field;
            }

            const formDataPayload = new FormData();

            formDataPayload.append("schema_id", data.id);
            formDataPayload.append("snapshot", JSON.stringify(fields));
            formDataPayload.append("answers", JSON.stringify(cleanAnswerData(formdata)));
            formDataPayload.append("due_date", date ? date.toISOString() : "");
            formDataPayload.append("priority", priorityState);
            // if (isoDocumentValue) {
            //     formData.append("iso_document", isoDocumentValue); // if backend expects string like ISO code
            // }

            // const fileList = Object.entries(formdata).forEach(([key, value]) => {
            //     if (value instanceof File) {
            //         formDataPayload.append(key, value);
            //     } else if (Array.isArray(value) && value.every((v) => v instanceof File)) {
            //         value.forEach((file) => formDataPayload.append(key, file));
            //     }
            // });


            // append uploaded files
            // if (fileList && fileList.length > 0) {
            //     fileList.forEach((file) => {
            //         formDataPayload.append("files", file); // same key as FilesInterceptor('files')
            //     });
            // }

            // add actual file field(s)
            Object.entries(formdata).forEach(([key, value]) => {
                if (value instanceof File) {
                    formDataPayload.append('files', value);
                } else if (Array.isArray(value) && value.every((v) => v instanceof File)) {
                    value.forEach((file) => formDataPayload.append('files', file));
                }
            });

            // if you have a dedicated ISO document file
            // payload.append("iso_document", isoFile);

            if (doc_mode === "edit") {
                formDataPayload.append("document_code", doc_id ?? "");
                updateDocumentMutation.mutate(
                    { ...formDataPayload } as any,
                    { onSuccess: () => router.push("/dashboard") }
                );
                return;
            }

            createDocumentMutation.mutate(formDataPayload as any);
            router.push("/dashboard");
            toast.success("สร้างเอกสารสำเร็จ");
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
        <form
            onSubmit={handleSubmit((formdata, event) => {
                const submitter = (event?.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
                onSubmit(formdata, submitter?.value ?? "");
            })}
            className="bg-slate-50 min-h-screen h-full w-full p-6"
        >
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
                    <div className="flex justify-between w-full">
                        <div className="w-1/2">
                            <div className="font-semibold">
                                <span>{"ISO ref. "}</span>
                            </div>
                            <div>
                                <input type="text" className="w-1/2 p-1.5 pl-2 py-2 border rounded bg-[#F3F4F8] text-sm" placeholder="iso ref."
                                    disabled={doc_mode == "view" || doc_mode == "approve"}
                                />
                            </div>
                        </div>
                        <div className="w-1/2">
                            <div className="w-full">
                                <div className="w-full flex justify-end">
                                    <span>{"ระดับความสำคัญ"}</span>
                                </div>
                                <div className="w-full flex justify-end">
                                    <Select
                                        isDisabled={doc_mode !== "create"}
                                        value={priority.find((op) => op.value === priorityState) || null}
                                        name="priority"
                                        id="priority"
                                        options={priority}
                                        className="w-1/2"
                                        onChange={(op) => setPriorityState(op?.value ?? "")}
                                    />
                                </div>
                            </div>
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
                    {(doc_mode === "create" ? fields : fieldsFromSnapshot).map((f: any) => (
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
                            <button className="text-white bg-black px-4 py-2 rounded-md hover:cursor-pointer" type="submit" value="REJECT">{"ตีกลับ"}</button>
                            <button className="text-white bg-red-500 px-4 py-2 rounded-md hover:cursor-pointer" type="submit" value="CANCEL">{"ยกเลิก"}</button>
                            <button className="text-white bg-[#4A4DF1] px-4 py-2 rounded-md hover:cursor-pointer" type="submit" value="APPROVE">{"อนุญาติ"}</button>
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