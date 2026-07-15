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
import { Suspense, useEffect, useState } from "react";
import Select from 'react-select'
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import FormSchema from "@/SampleData/form.json"
import FormDetail from "@/SampleData/form_detail.json"
import { startOfDay, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import Signature from "@/public/example_sign.png"
import { toast } from "react-toastify";

type FormSubmission = {
    form_id: string;
    schema_id: string;
    answer: Record<string, any>;
};

function FormPageContent() {
    const useParams = useSearchParams();
    const schema_id = useParams.get('schema_id');
    const doc_id = useParams.get('doc_id');
    const doc_mode = useParams.get('mode');
    const router = useRouter();
    const [date, setDate] = useState<Date>()
    const [selectedForm, setSelectedForm] = useState<any>(null);
    const [approver, setApprover] = useState([
        { name: "" }
    ]);
    const ApproverLists = [
        { value: "2168160", label: "หัวหน้าแผนก" }, //2168160
        { value: "2153002", label: "วรรณนิศา ฉัตรอมรวงศ์ (คุณเบส)" }, //2153002
        { value: "2159001", label: "วงศรันย์ ฉัตรอมรวงศ์ (คุณเบน)" }, //2159001
        { value: "2254002", label: "วงศกร ฉัตรอมรวงศ์ (คุณบิว)" }, //2254002
    ];

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

    const onSubmit = (data: Record<string, any>) => {
        const payload: FormSubmission = {
            form_id: "it request",
            schema_id: "it_001",
            answer: data,
        };

        console.log(payload)
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

    const formApprover = FormDetail.find((form: any) => form.document_id === doc_id)?.approval.steps
    const isApproved = formApprover?.filter((step: any) => step.status === "approved") ?? []

    useEffect(() => {
        const values =
            FormSchema.form
                .find((form) => form.schema_id === schema_id)
                ?.form_detail.reduce(
                    (acc, field) => {
                        acc[field.id] = "";
                        return acc;
                    },
                    {} as Record<string, any>
                ) ?? {};
        form.reset(values);

        const schema = FormSchema.form.find((form) => form.schema_id == schema_id)
        setSelectedForm(schema)

        if (doc_mode == "edit" || doc_mode == "view" || doc_mode == "approve") {
            const doc = FormDetail.find(
                (form) => form.document_id === doc_id
            );
            const date = new Date(parseISO(doc?.due_dete || ""));
            setDate(date)
            form.reset(doc?.answer);
        }
    }, [doc_id, form]);

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
                    <span>{selectedForm?.name}</span>
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
                    {selectedForm?.approver_type == "document" ? approver.map((app, index) => (
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
                    {selectedForm?.form_detail.map((f: any) => (
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
                        {selectedForm?.form_detail.length > 0 && (
                            <div className="flex justify-end pt-2 mt-2">
                                <div className="flex gap-2">
                                    <button onClick={() => changePage("/dashboard")}
                                        type="submit"
                                        className="px-5 py-2.5 rounded-lg bg-red-500 hover:cursor-pointer"
                                        style={{ color: "var(--primary-foreground)", fontSize: "1rem", fontWeight: 500 }}
                                    >
                                        {"ยกเลิก"}
                                    </button>
                                    <button onClick={() => changePage("/dashboard")}
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
                            <button className="text-white bg-[#4A4DF1] px-4 py-2 rounded-md hover:cursor-pointer" onClick={() => {
                                toast.success("อนุมัติเอกสารสำเร็จ")
                                changePage("/dashboard")
                            }}>{"อนุญาติ"}</button>
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
                        {isApproved.map((app: any, index: number) => (
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
                        ))}
                    </div>
                </div>
            )}
        </form>
    )
}

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6">Loading...</div>}>
            <FormPageContent />
        </Suspense>
    );
}