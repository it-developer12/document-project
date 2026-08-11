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
import FormDetail from "@/SampleData/form_detail.json"
import { startOfDay, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import Signature from "@/public/example_sign.png"
import { toast } from "react-toastify";
import Loading from "@/app/component/loading";
import { approveMutation } from "@/hooks/approve-document";
import { useCreateDocument } from "@/hooks/create-document";
import { useGetDocuments } from "@/hooks/set-document";

type FormSubmission = {
    document_no: string;
    schema_id: string;
    answers: string;
    snapshot: string;
    due_date: string;
    iso_document?: string;
};

const dataFromBackend = {
    "id": "e63726b1-0d3b-4006-a34f-8b10509236f1",
    "approvalSource": "TEMPLATE",
    "code": "FO-IT-001",
    "name": "แบบฟอร์มเปิกทรัพย์สิน",
    "status": true,
    "companyId": "ad3104d0-1a15-4a1c-9300-b42d79fc7994",
    "divisionId": "9a34d702-6f51-4fbe-b887-6c89779e6fe9",
    "schemaVersion": [
        {
            "id": "c35e7403-f782-4804-ae65-453045173785",
            "formSchemaId": "e63726b1-0d3b-4006-a34f-8b10509236f1",
            "version": 1,
            "isActive": true,
            "workflowDefinitionVersionId": "93b4f669-f319-4afc-87d0-b3adf4ee8959",
            "createdAt": "2026-08-05T08:09:28.415Z",
            "createdById": "bada0b01-9f79-494b-a7a9-ac0897f22924",
            "fields": [
                {
                    "formSchemaVersionId": "c35e7403-f782-4804-ae65-453045173785",
                    "formFieldId": "f4394492-22bd-4125-a3fb-d024a1c6f687",
                    "required": true,
                    "displayOrder": 1,
                    "width": "full",
                    "fields": {
                        "id": "f4394492-22bd-4125-a3fb-d024a1c6f687",
                        "fieldKey": "employee_detail-field-10001",
                        "label": "ข้อมูลพนักงาน",
                        "type": "employee_detail",
                        "helpText": "",
                        "option": {}
                    }
                },
                {
                    "formSchemaVersionId": "c35e7403-f782-4804-ae65-453045173785",
                    "formFieldId": "db5189c2-82de-46f4-832d-883bf8e705fd",
                    "required": true,
                    "displayOrder": 2,
                    "width": "full",
                    "fields": {
                        "id": "db5189c2-82de-46f4-832d-883bf8e705fd",
                        "fieldKey": "text-field-101",
                        "label": "สาเหตุ",
                        "type": "text",
                        "helpText": "",
                        "option": {}
                    }
                },
                {
                    "formSchemaVersionId": "c35e7403-f782-4804-ae65-453045173785",
                    "formFieldId": "ebaf5e7a-fb1f-42b1-9cee-a9e682424924",
                    "required": true,
                    "displayOrder": 3,
                    "width": "full",
                    "fields": {
                        "id": "ebaf5e7a-fb1f-42b1-9cee-a9e682424924",
                        "fieldKey": "table-field-102",
                        "label": "รายการทรัพย์สิน",
                        "type": "table",
                        "helpText": "",
                        "option": "{\"minRows\":1,\"maxRows\":20,\"columns\":[{\"id\":\"col-1\",\"label\":\"รหัสทรัพย์สิน\",\"type\":\"text\",\"width\":1},{\"id\":\"col-2\",\"label\":\"รายการ\",\"type\":\"text\",\"width\":2},{\"id\":\"col-3\",\"label\":\"จำนวน\",\"type\":\"number\",\"width\":1},{\"id\":\"col-4\",\"label\":\"หน่วย\",\"type\":\"text\",\"width\":1},{\"id\":\"col-11\",\"label\":\"สถานที่จัดเก็บทรัพย์สิน\",\"type\":\"text\",\"width\":2}]}"
                    }
                }
            ]
        }
    ]
}

const data_fields = dataFromBackend.schemaVersion[0].fields.map(item => ({
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
}));

const fields = data_fields.map((field) => {
    if (field.option) {
        const { option, ...rest } = field;
        return { ...rest, ...(option ?? {}) };
    }
    return field;
});


const getDataFromBackend = {
    id: "5a62fcb3-4b47-40af-bd08-f982557f9ab0",
    documentNo: "DOC-IT-001",
    formSchemaId: "e63726b1-0d3b-4006-a34f-8b10509236f1",
    createdById: "bada0b01-9f79-494b-a7a9-ac0897f22924",
    status: "WAITING_APPROVAL",
    currentRevisionId: "6d5c341e-e02a-4dbc-be0f-16a2a48ccf60",
    createdAt: "2026-08-05T09:57:49.869Z",
    updatedAt: "2026-08-05T09:57:49.895Z",
    currentRevision: {
        id: "6d5c341e-e02a-4dbc-be0f-16a2a48ccf60",
        documentId: "5a62fcb3-4b47-40af-bd08-f982557f9ab0",
        revisionNo: 1,
        snapshot: "[{\"id\":\"f4394492-22bd-4125-a3fb-d024a1c6f687\",\"type\":\"employee_detail\",\"label\":\"ข้อมูลพนักงาน\",\"placeholder\":\"\",\"required\":true,\"helpText\":\"\",\"width\":\"full\"},{\"id\":\"db5189c2-82de-46f4-832d-883bf8e705fd\",\"type\":\"text\",\"label\":\"สาเหตุ\",\"placeholder\":\"\",\"required\":true,\"helpText\":\"\",\"width\":\"full\"},{\"id\":\"ebaf5e7a-fb1f-42b1-9cee-a9e682424924\",\"type\":\"table\",\"label\":\"รายการทรัพย์สิน\",\"placeholder\":\"\",\"required\":true,\"helpText\":\"\",\"width\":\"full\",\"minRows\":1,\"maxRows\":20,\"columns\":[{\"id\":\"col-1\",\"label\":\"รหัสทรัพย์สิน\",\"type\":\"text\",\"width\":1},{\"id\":\"col-2\",\"label\":\"รายการ\",\"type\":\"text\",\"width\":2},{\"id\":\"col-3\",\"label\":\"จำนวน\",\"type\":\"number\",\"width\":1},{\"id\":\"col-4\",\"label\":\"หน่วย\",\"type\":\"text\",\"width\":1},{\"id\":\"col-11\",\"label\":\"สถานที่จัดเก็บทรัพย์สิน\",\"type\":\"text\",\"width\":2}]}]",
        formData: "{\"f4394492-22bd-4125-a3fb-d024a1c6f687\":{\"employee_code\":\"2169089\",\"position\":\"เจ้าหน้าที่พัฒนาซอฟต์แวร์\",\"division\":\"เทคโนโลยีสารสนเทศ\",\"department\":\"พัฒนาเทคโนโลยีโซลูชั่น\",\"first_name\":\"Mock Name 13\",\"last_name\":\"Mock Surname 13\",\"company\":\"cff\"},\"db5189c2-82de-46f4-832d-883bf8e705fd\":\"เริ่มงานใหม่\",\"ebaf5e7a-fb1f-42b1-9cee-a9e682424924\":[{\"col-1\":\"WF-2130-3131\",\"col-2\":\"โน๊ตบุ๊ค\",\"col-3\":\"1\",\"col-4\":\"เครื่อง\",\"col-11\":\"บางบอนชั้น 2\"}]}",
        submittedById: "bada0b01-9f79-494b-a7a9-ac0897f22924",
        submittedAt: "2026-08-05T09:57:49.875Z",
        createdAt: "2026-08-05T09:57:49.875Z"
    },
    createdBy: {
        id: "bada0b01-9f79-494b-a7a9-ac0897f22924",
        entra_id: null,
        employee_code: "2169089",
        title: "MR",
        firstName: "นครินทร์",
        lastName: "โสดา",
        firstNameEn: null,
        lastNameEn: null,
        email: null,
        role: "ADMIN",
        status: true,
        createdAt: "2026-07-27T08:16:31.056Z",
        updatedAt: "2026-07-27T08:16:31.056Z",
        companyId: "ad3104d0-1a15-4a1c-9300-b42d79fc7994",
        positionId: "e141fdf0-625a-43dc-8f77-a2f35772379c",
        users: [
            {
                id: "1cd97403-f174-4404-9ea3-9e0eb980b941",
                userName: "admin",
                userInfoId: "bada0b01-9f79-494b-a7a9-ac0897f22924",
                userInfo: {
                    id: "bada0b01-9f79-494b-a7a9-ac0897f22924",
                    entra_id: null,
                    employee_code: "2169089",
                    title: "MR",
                    firstName: "นครินทร์",
                    lastName: "โสดา",
                    firstNameEn: null,
                    lastNameEn: null,
                    email: null,
                    role: "ADMIN",
                    status: true,
                    createdAt: "2026-07-27T08:16:31.056Z",
                    updatedAt: "2026-07-27T08:16:31.056Z",
                    companyId: "ad3104d0-1a15-4a1c-9300-b42d79fc7994",
                    positionId: "e141fdf0-625a-43dc-8f77-a2f35772379c"
                }
            }
        ]
    }
}
const { currentRevision } = getDataFromBackend;
const fieldsFromBackend = JSON.parse(currentRevision.snapshot);
const answersFromBackend = JSON.parse(currentRevision.formData);

const employeeField = fields.find(
    (field) => field.type === "employee_detail"
);

const result = { ...answersFromBackend };

if (employeeField && employeeField.id in result) {
    result.employee_field = result[employeeField.id];
    delete result[employeeField.id];
}
console.log(employeeField)
console.log(result)
const dataDeJSON = {
    fields: fieldsFromBackend,
    answers: result,
}

console.log("dataDeJSON", dataDeJSON)

function FormPageContent() {
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
        const approveMutate = approveMutation();
        const { employee_field } = data;

        if (doc_mode === "approve") {
            approveMutate.mutate({
                document_code: dataFromBackend.code,
                decision: "APPROVE",
                comment: ""
            });

            if (approveMutate.isSuccess) {
                toast.success("อนุมัติเอกสารสำเร็จ");
                router.push("/approve");
            }
        } else if (doc_mode === "create") {
            const createDocumentMutation = useCreateDocument();

            const employeeField = fields.find(
                (field) => field.type === "employee_detail" // or "employee_field"
            );

            if (employeeField && employee_field) {
                data[employeeField.id] = data.employee_field;
                delete data.employee_field;
            }
            const JSONfields = JSON.stringify(fields);
            const JSONdata = JSON.stringify(data);
            const payload: FormSubmission = {
                document_no: dataFromBackend.code,
                schema_id: dataFromBackend.id,
                answers: JSONdata,
                snapshot: JSONfields,
                due_date: date ? date.toISOString() : "",
                iso_document: "", // Add this line to include the iso_document field
            };

            createDocumentMutation.mutate(payload);

            console.log(payload)
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

    const formApprover = FormDetail.find((form: any) => form.document_id === doc_id)?.approval.steps
    const isApproved = formApprover?.filter((step: any) => step.status === "approved") ?? []

    useEffect(() => {
        const values =
            fields.map((field) => field.id).reduce(
                (acc, id) => {
                    acc[id] = "";
                    return acc;
                },
                {} as Record<string, any>
            ) ?? {};
        form.reset(values);

        if (doc_mode == "edit" || doc_mode == "view" || doc_mode == "approve") {
            // const date = new Date(parseISO(doc?.due_dete || ""));
            // setDate(date)
            form.reset(dataDeJSON.answers);
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
                    <span>{dataFromBackend.name}</span>
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
                    {dataFromBackend.approvalSource != "TEMPLATE" ? approver.map((app, index) => (
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
        <Suspense fallback={<Loading />}>
            <FormPageContent />
        </Suspense>
    );
}