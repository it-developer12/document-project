"use client"
import { Icon } from '@iconify/react';
import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Link from 'next/link';
import { useState } from 'react';
import { columns } from '@/app/component/DocumentColumn';
import { DataTable } from '@/app/component/DocumentTable';
import { BrushCleaning } from 'lucide-react';
import { useDocumentStore } from '@/store/document.store';
import { useGetDocuments } from '@/hooks/set-document';
import { useDocumentCount } from '@/hooks/document-list';
import { useCompanyList, useDivisionList } from '@/hooks/create-form';
import { useCurrentUser } from '@/hooks/use-current-user';

type DocStatus = "WAITING_APPROVAL" | "PROCESSING" | "REJECTED" | "CANCELLED" | "COMPLETED" | "DRAFT";
type Status = "low" | "medium" | "high";
type TableDoc = {
    id: string;
    title: string;
    priority: Status;
    owner: string;
    department: string;
    company: string;
    status: DocStatus;
    created: string;
    updated: string;
    end_date: string;
    type: any[];
    schema_id: string;
    created_by: string;
    can_edit: boolean;
}

interface TableState {
    status: boolean;
    text: string;
    department: string;
    company: string;
    document_list: TableDoc[];
}

const EMPTY_TABLE_STATE: TableState = {
    status: false,
    text: "",
    department: "",
    company: "",
    document_list: [],
};

function filterDocuments(documents: TableDoc[], table: TableState) {
    const searchText = table.text.trim().toLowerCase();

    return documents.filter((doc) => {
        const matchesText =
            !searchText ||
            doc.title.toLowerCase().includes(searchText) ||
            doc.id.toLowerCase().includes(searchText);
        const matchesDepartment =
            !table.department || doc.department.toLowerCase() === table.department.toLowerCase();
        const matchesCompany = !table.company || doc.company === table.company;

        return matchesText && matchesDepartment && matchesCompany;
    });
}

function getType(workflowInstance: any) {
    const workflow = workflowInstance?.workflowDefinitionVersion?.workflowStep?.map((step: any) => step.type) ?? []
    const execution = workflowInstance?.executions[0]?.steps?.map((exe: any) => exe.type) ?? []
    return [...workflow, ...execution]
}

export default function Home() {
    const { data: divisionList } = useDivisionList();
    const { data: companyList } = useCompanyList();
    const { data: currentUser } = useCurrentUser();
    useGetDocuments();
    const count = useDocumentCount();
    const docs = useDocumentStore((state) => state.documents);
    const appDocs = useDocumentStore((state) => state.approveDocuments)
    const proDocs = useDocumentStore((state) => state.processDocuments)

    const COMPANY_OPTIONS = companyList?.map((company: any) => ({
        label: company.name,
        value: company.code,
    })) ?? [];

    const DEPARTMENT_OPTIONS = divisionList?.map((division: any) => ({
        label: division.name,
        value: division.name,
    })) ?? [];

    const currentUserFullName = currentUser
        ? `${currentUser.user_info.firstName} ${currentUser.user_info.lastName}`.trim()
        : "";
    const DOCUMENT: TableDoc[] = docs.map((doc) => ({
        id: doc.documentNo,
        title: doc.formSchema.name,
        priority: doc.priority as Status,
        owner: doc.createdBy.firstName,
        company: doc.currentRevision.company.code,
        department: doc.formSchema.division.name,
        status: doc.status as DocStatus,
        created: doc.createdAt,
        end_date: doc.dueDate,
        updated: doc.activities[0]?.createdAt,
        type: getType(doc.workflowInstance),
        schema_id: doc.formSchema.code,
        created_by: doc.createdBy.firstName + " " + doc.createdBy.lastName,
        can_edit: (doc.createdById ?? doc.createdBy.id)
            ? (doc.createdById ?? doc.createdBy.id) === currentUser?.user_info.id
            : currentUserFullName !== "" &&
            doc.createdBy.firstName + " " + doc.createdBy.lastName === currentUserFullName,
    }))

    const CREATETABLE: TableDoc[] = DOCUMENT.filter(
        (doc) => currentUserFullName !== "" && doc.created_by === currentUserFullName,
    );
    const todoDocumentIds = new Set(
        DOCUMENT.filter((doc) => {
            if (doc.type.length > 0 && doc.status !== "COMPLETED") {
                return doc
            }
        }).map((doc) => doc.id),
    );
    const TODOTABLE = DOCUMENT.filter((doc) => todoDocumentIds.has(doc.id));
    const finishDocuments = DOCUMENT.filter(
        (doc) => doc.type.includes("FINISHER") && doc.status === "PROCESSING",
    );
    const excludedDocumentIds = new Set(
        [...CREATETABLE, ...TODOTABLE].map((doc) => doc.id),
    );
    const ALLDOCUMENT: TableDoc[] = DOCUMENT.filter(
        (doc) => !excludedDocumentIds.has(doc.id),
    );

    const [todoTable, setTodoTable] = useState<TableState>(EMPTY_TABLE_STATE);
    const [createTable, setCreateTable] = useState<TableState>(EMPTY_TABLE_STATE);
    const [documentTable, setDocumentTable] = useState<TableState>(EMPTY_TABLE_STATE);

    function handleSearch(name: "todo" | "create" | "document") {
        const tableState = name === "todo" ? todoTable : name === "create" ? createTable : documentTable;
        const sourceDocuments = name === "todo" ? TODOTABLE : name === "create" ? CREATETABLE : ALLDOCUMENT;
        const setTableState = name === "todo" ? setTodoTable : name === "create" ? setCreateTable : setDocumentTable;

        setTableState({
            ...tableState,
            document_list: filterDocuments(sourceDocuments, tableState),
            status: true,
        });
    }

    return (
        <div className="min-h-screen w-full bg-slate-50 p-4 sm:p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="">
                    <p className="mb-1 text-sm font-medium text-indigo-600">ศูนย์รวมเอกสาร</p>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">ภาพรวมเอกสาร</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        ดูงานที่ต้องดำเนินการ เอกสารที่คุณสร้าง และเอกสารที่คุณมีสิทธิ์เข้าถึง
                        <span className="mt-1 block text-xs text-slate-500">เลือกเลขที่เอกสารในตารางเพื่อเปิดดูรายละเอียด</span>
                    </p>
                </div>
                <div className={`grid w-full gap-2 lg:w-auto ${currentUser?.user_info.role === "ADMIN" ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
                    <Link
                        href="/document_list"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#4A4DF1] px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
                    >
                        <Icon icon="ic:baseline-plus" className="text-lg" aria-hidden="true" />
                        <span>สร้างเอกสารใหม่</span>
                    </Link>
                    {currentUser?.user_info.role === "ADMIN" && (
                        <Link
                            href="/create"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-800 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
                        >
                            <Icon icon="material-symbols:edit-document-outline" className="text-lg" aria-hidden="true" />
                            <span>สร้างแบบฟอร์มใหม่</span>
                        </Link>
                    )}
                </div>
            </div>

            <div className="flex flex-col overflow-hidden rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="border-b p-4 sm:p-5" style={{ borderColor: "var(--border)" }}>
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold" style={{ color: "var(--foreground)" }}>งานที่ต้องดำเนินการ</h2>
                        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">{TODOTABLE.length}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">เลือกประเภทงานเพื่อไปยังรายการที่ต้องจัดการ</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <Link
                            href="/approve"
                            className="flex min-h-20 items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 transition hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
                        >
                            <span>
                                <span className="block font-semibold text-amber-950">รออนุมัติ</span>
                                <span className="mt-1 block text-xs text-amber-800">ดูรายการอนุมัติ</span>
                            </span>
                            <span className="rounded-full bg-amber-200 px-2.5 py-1 text-sm font-bold text-amber-950">{appDocs.length}</span>
                        </Link>
                        <Link
                            href="/process"
                            className="flex min-h-20 items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 transition hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                        >
                            <span>
                                <span className="block font-semibold text-blue-950">กำลังดำเนินการ</span>
                                <span className="mt-1 block text-xs text-blue-800">ดูรายการดำเนินการ</span>
                            </span>
                            <span className="rounded-full bg-blue-200 px-2.5 py-1 text-sm font-bold text-blue-950">{proDocs.length}</span>
                        </Link>
                        <Link
                            href="/complete"
                            className="flex min-h-20 items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 transition hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                        >
                            <span>
                                <span className="block font-semibold text-emerald-950">รอปิดจบเอกสาร</span>
                                <span className="mt-1 block text-xs text-emerald-800">ดูรายการปิดจบ</span>
                            </span>
                            <span className="rounded-full bg-emerald-200 px-2.5 py-1 text-sm font-bold text-emerald-950">{finishDocuments.length}</span>
                        </Link>
                    </div>
                </div>
                {/* Table toolbar */}
                <div className="flex flex-col gap-3 border-b px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: "var(--border)" }}>
                    <h3 style={{ color: "var(--foreground)" }}>ค้นหาในงานที่ต้องดำเนินการ</h3>
                    <div className={`grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-3/4 ${todoTable.status ? "lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"}`}>
                        {todoTable.status && (
                            <button aria-label="ล้างตัวกรอง" className='flex items-center justify-center rounded border p-1.5 hover:cursor-pointer' onClick={() => setTodoTable({
                                status: false,
                                text: "",
                                department: "",
                                company: "",
                                document_list: TODOTABLE
                            })}>
                                <BrushCleaning size={"20px"} />
                            </button>
                        )}
                        <div
                            className="flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2"
                            style={{ borderColor: "var(--border)", background: "var(--input-background)" }}
                        >
                            <Icon icon="tabler:search" className="text-[14px]" style={{ color: "var(--muted-foreground)" }} />
                            <input
                                aria-label="ค้นหาเอกสาร"
                                placeholder="ค้นหาเอกสาร..."
                                className="w-full min-w-0 bg-transparent outline-none"
                                style={{ fontSize: "0.8rem", color: "var(--foreground)" }}
                                value={todoTable.text}
                                onChange={(e) => setTodoTable(prev => ({ ...prev, text: e.target.value }))}
                            />
                        </div>

                        <div className="min-w-0">
                            <Select
                                items={DEPARTMENT_OPTIONS}
                                value={todoTable.department}
                                onValueChange={(seleted: any) => setTodoTable(prev => ({ ...prev, department: seleted }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="แผนก" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {DEPARTMENT_OPTIONS.map((item: any) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="min-w-0">
                            <Select
                                items={COMPANY_OPTIONS}
                                value={todoTable.company}
                                onValueChange={(seleted: any) => setTodoTable(prev => ({ ...prev, company: seleted }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="บริษัท" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {COMPANY_OPTIONS.map((item: any) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <button type="button" onClick={() => handleSearch("todo")} className="h-10 w-full rounded-md bg-[#4A4DF1] px-4 text-sm font-medium text-white hover:cursor-pointer hover:bg-indigo-700 lg:w-auto">ค้นหา</button>
                        </div>
                    </div>
                </div>
                <div className=''>
                    <DataTable columns={columns} data={todoTable.status ? todoTable.document_list : TODOTABLE} pageSize={5} />
                </div>
            </div>
            <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{"เอกสารทั้งหมด"}</CardTitle>
                        <CardAction>
                            <div className="bg-[#d3e8ff] rounded-lg p-2">
                                <Icon icon="carbon:document" className="text-lg text-[#007bff]" />
                            </div>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{count.data?.total || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{"เอกสารที่อนุมัติแล้ว"}</CardTitle>
                        <CardAction>
                            <div className="bg-[#d3ffd9] rounded-lg p-2">
                                <Icon icon="material-symbols:check-box-outline" className="text-lg text-[#00b318]" />
                            </div>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{count.data?.approved || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{"เอกสารที่กำลังดำเนินการ"}</CardTitle>
                        <CardAction>
                            <div className="bg-[#fcffd3] rounded-lg p-2">
                                <Icon icon="tabler:clock" className="text-lg text-[#9eaa00]" />
                            </div>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{count.data?.processing || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{"เอกสารที่ถูกยกเลิก"}</CardTitle>
                        <CardAction>
                            <div className="bg-[#ffd3d3] rounded-lg p-2">
                                <Icon icon="material-symbols:error-outline-rounded" className="text-lg text-[#d60000]" />
                            </div>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{count.data?.cancelled || 0}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col overflow-hidden rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                {/* Table toolbar */}
                <div className="flex flex-col gap-3 border-b px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: "var(--border)" }}>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 style={{ color: "var(--foreground)" }} className="font-bold">เอกสารที่คุณสร้าง</h2>
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{CREATETABLE.length}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">เอกสารที่สร้างโดยบัญชีของคุณ</p>
                    </div>
                    <div className={`grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-3/4 ${createTable.status ? "lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"}`}>
                        {createTable.status && (
                            <button aria-label="ล้างตัวกรอง" className='flex items-center justify-center rounded border p-1.5 hover:cursor-pointer' onClick={() => setCreateTable({
                                status: false,
                                text: "",
                                department: "",
                                company: "",
                                document_list: CREATETABLE
                            })}>
                                <BrushCleaning size={"20px"} />
                            </button>
                        )}
                        <div
                            className="flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2"
                            style={{ borderColor: "var(--border)", background: "var(--input-background)" }}
                        >
                            <Icon icon="tabler:search" className="text-[14px]" style={{ color: "var(--muted-foreground)" }} />
                            <input
                                aria-label="ค้นหาเอกสาร"
                                placeholder="ค้นหาเอกสาร..."
                                className="w-full min-w-0 bg-transparent outline-none"
                                style={{ fontSize: "0.8rem", color: "var(--foreground)" }}
                                value={createTable.text}
                                onChange={(e) => setCreateTable(prev => ({ ...prev, text: e.target.value }))}
                            />
                        </div>

                        <div className="min-w-0">
                            <Select
                                items={DEPARTMENT_OPTIONS}
                                value={createTable.department}
                                onValueChange={(seleted: any) => setCreateTable(prev => ({ ...prev, department: seleted }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="แผนก" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {DEPARTMENT_OPTIONS.map((item: any) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="min-w-0">
                            <Select
                                items={COMPANY_OPTIONS}
                                value={createTable.company}
                                onValueChange={(seleted: any) => setCreateTable(prev => ({ ...prev, company: seleted }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="บริษัท" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {COMPANY_OPTIONS.map((item: any) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <button type="button" onClick={() => handleSearch("create")} className="h-10 w-full rounded-md bg-[#4A4DF1] px-4 text-sm font-medium text-white hover:cursor-pointer hover:bg-indigo-700 lg:w-auto">ค้นหา</button>
                        </div>
                    </div>
                </div>
                <div className=''>
                    <DataTable columns={columns} data={createTable.status ? createTable.document_list : CREATETABLE} pageSize={8} />
                </div>
            </div>

            <div className="mt-6 flex flex-col overflow-hidden rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                {/* Table toolbar */}
                <div className="flex flex-col gap-3 border-b px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: "var(--border)" }}>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 style={{ color: "var(--foreground)" }} className="font-bold">เอกสารอื่นที่คุณมีสิทธิ์ดู</h2>
                            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700">{ALLDOCUMENT.length}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">เอกสารที่เข้าถึงได้ นอกเหนือจากงานและเอกสารที่คุณสร้าง</p>
                    </div>
                    <div className={`grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:w-3/4 ${documentTable.status ? "lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"}`}>
                        {documentTable.status && (
                            <button aria-label="ล้างตัวกรอง" className='flex items-center justify-center rounded border p-1.5 hover:cursor-pointer' onClick={() => setDocumentTable({
                                status: false,
                                text: "",
                                department: "",
                                company: "",
                                document_list: ALLDOCUMENT
                            })}>
                                <BrushCleaning size={"20px"} />
                            </button>
                        )}
                        <div
                            className="flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2"
                            style={{ borderColor: "var(--border)", background: "var(--input-background)" }}
                        >
                            <Icon icon="tabler:search" className="text-[14px]" style={{ color: "var(--muted-foreground)" }} />
                            <input
                                aria-label="ค้นหาเอกสาร"
                                placeholder="ค้นหาเอกสาร..."
                                className="w-full min-w-0 bg-transparent outline-none"
                                style={{ fontSize: "0.8rem", color: "var(--foreground)" }}
                                value={documentTable.text}
                                onChange={(e) => setDocumentTable(prev => ({ ...prev, text: e.target.value }))}
                            />
                        </div>

                        <div className="min-w-0">
                            <Select
                                items={DEPARTMENT_OPTIONS}
                                value={documentTable.department}
                                onValueChange={(seleted: any) => setDocumentTable(prev => ({ ...prev, department: seleted }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="แผนก" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {DEPARTMENT_OPTIONS.map((item: any) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="min-w-0">
                            <Select
                                items={COMPANY_OPTIONS}
                                value={documentTable.company}
                                onValueChange={(seleted: any) => setDocumentTable(prev => ({ ...prev, company: seleted }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="บริษัท" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {COMPANY_OPTIONS.map((item: any) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <button type="button" onClick={() => handleSearch("todo")} className="h-10 w-full rounded-md bg-[#4A4DF1] px-4 text-sm font-medium text-white hover:cursor-pointer hover:bg-indigo-700 lg:w-auto">ค้นหา</button>
                        </div>
                    </div>
                </div>
                <div className=''>
                    <DataTable columns={columns} data={documentTable.status ? documentTable.document_list : ALLDOCUMENT} pageSize={10} />
                </div>
            </div>
        </div>
    );
}
