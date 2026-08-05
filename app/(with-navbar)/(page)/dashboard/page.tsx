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

type DocStatus = "Draft" | "Approved" | "Processing" | "Completed" | "Cancelled" | "Pending" | "Rejected";
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

const EMPTY_DOCUMENTS: TableDoc[] = [];

const TODO_DOCUMENTS: TableDoc[] = [
        { id: "DOC-IT-001", title: "แบบฟอร์มเบิกทรัพย์สิน", priority: "high", owner: "Brian", company: "cff", department: "IT", status: "Processing", created: "2024-11-01", updated: "2024-11-08", end_date: "2024-11-08" },
        { id: "DOC-IT-002", title: "แบบฟอร์มการขอเข้าใช้งานระบบคอมพิวเตอร์", priority: "low", owner: "Jame", company: "cff", department: "IT", status: "Completed", created: "2024-10-30", updated: "2024-11-07", end_date: "2024-10-30" },
        { id: "DOC-IT-003", title: "แบบฟอร์มร้องขอดำเนินการด้าน IT", priority: "high", owner: "Brian", company: "cff", department: "IT", status: "Pending", created: "2024-10-30", updated: "2024-11-07", end_date: "2024-10-30" },
        { id: "DOC-IT-004", title: "แบบฟอร์มร้องขอดำเนินการด้าน IT", priority: "high", owner: "Marry", company: "cff", department: "Finance", status: "Processing", created: "2024-10-30", updated: "2024-11-07", end_date: "2024-10-30" },
    ]

const MY_DOCUMENTS: TableDoc[] = [
        { id: "DOC-IT-001", title: "แบบฟอร์มเบิกทรัพย์สิน", priority: "high", owner: "Brian", company: "cff", department: "IT", status: "Processing", created: "2024-11-01", updated: "2024-11-08", end_date: "2024-11-08" },
        { id: "DOC-IT-002", title: "แบบฟอร์มการขอเข้าใช้งานระบบคอมพิวเตอร์", priority: "low", owner: "Jame", company: "cff", department: "IT", status: "Completed", created: "2024-10-30", updated: "2024-11-07", end_date: "2024-10-30" },
        { id: "DOC-IT-003", title: "แบบฟอร์มร้องขอดำเนินการด้าน IT", priority: "high", owner: "Brian", company: "cff", department: "IT", status: "Pending", created: "2024-10-30", updated: "2024-11-07", end_date: "2024-10-30" },
    ]

const ALL_DOCUMENTS: TableDoc[] = [
        { id: "DOC-IT-001", title: "แบบฟอร์มเบิกทรัพย์สิน", priority: "high", owner: "Brian", company: "cff", department: "IT", status: "Processing", created: "2024-11-01", updated: "2024-11-08", end_date: "2024-11-08" },
        { id: "DOC-IT-002", title: "แบบฟอร์มการขอเข้าใช้งานระบบคอมพิวเตอร์", priority: "low", owner: "Jame", company: "cff", department: "IT", status: "Completed", created: "2024-10-30", updated: "2024-11-07", end_date: "2024-10-30" },
        { id: "DOC-IT-003", title: "แบบฟอร์มร้องขอดำเนินการด้าน IT", priority: "high", owner: "Brian", company: "cff", department: "IT", status: "Pending", created: "2024-10-30", updated: "2024-11-07", end_date: "2024-10-30" },
        { id: "DOC-IT-004", title: "แบบฟอร์มร้องขอดำเนินการด้าน IT", priority: "high", owner: "Marry", company: "cff", department: "IT", status: "Processing", created: "2024-10-30", updated: "2024-11-07", end_date: "2024-10-30" },
        { id: "DOC-IT-005", title: "แบบฟอร์มการขอเข้าใช้งานระบบคอมพิวเตอร์", priority: "low", owner: "Sarah Chen", company: "cff", department: "IT", status: "Pending", created: "2024-11-01", updated: "2024-11-08", end_date: "2024-11-20" },
        { id: "DOC-IT-006", title: "แบบฟอร์มเบิกทรัพย์สิน", priority: "medium", owner: "Sarah Chen", company: "ctx", department: "IT", status: "Processing", created: "2024-11-01", updated: "2024-11-08", end_date: "2024-11-20" },
        { id: "DOC-IT-007", title: "แบบฟอร์มร้องขอดำเนินการด้าน IT", priority: "high", owner: "Ken", company: "cff", department: "IT", status: "Draft", created: "2024-10-30", updated: "2024-11-07", end_date: "2024-10-30" },
        { id: "DOC-IT-010", title: "แบบฟอร์มการขอเข้าใช้งานระบบคอมพิวเตอร์", priority: "low", owner: "Sarah Chen", company: "cff", department: "IT", status: "Pending", created: "2024-11-01", updated: "2024-11-08", end_date: "2024-11-20" },
        { id: "DOC-IT-020", title: "แบบฟอร์มเบิกทรัพย์สิน", priority: "medium", owner: "Sarah Chen", company: "ctx", department: "IT", status: "Processing", created: "2024-11-01", updated: "2024-11-08", end_date: "2024-11-20" },
        { id: "DOC-IT-031", title: "แบบฟอร์มร้องขอดำเนินการด้าน IT", priority: "high", owner: "Garry", company: "cff", department: "IT", status: "Rejected", created: "2024-10-30", updated: "2024-11-07", end_date: "2024-10-30" },
        { id: "DOC-IT-040", title: "แบบฟอร์มการขอเข้าใช้งานระบบคอมพิวเตอร์", priority: "low", owner: "Sarah Chen", company: "cff", department: "IT", status: "Pending", created: "2024-11-01", updated: "2024-11-08", end_date: "2024-11-20" },
        { id: "DOC-IT-013", title: "แบบฟอร์มเบิกทรัพย์สิน", priority: "medium", owner: "Sarah Chen", company: "ctx", department: "IT", status: "Processing", created: "2024-11-01", updated: "2024-11-08", end_date: "2024-11-20" },
    ]

    // async function getData(): Promise<DocumentColumn[]> {
    //      fetch data with api
    //     return [ data from api ]
    // } 

const COMPANY_OPTIONS = [
    { label: "Cityfresh Fruit", value: "cff" },
    { label: "Ctx holding", value: "ctx" },
    { label: "Noble marketing", value: "nbm" },
];

const DEPARTMENT_OPTIONS = [
    { label: "Innovation Technology", value: "it" },
    { label: "Finance", value: "finance" },
    { label: "B2C", value: "b2c" },
];

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

export default function Home() {
    const [todoTable, setTodoTable] = useState<TableState>(EMPTY_TABLE_STATE);
    const [createTable, setCreateTable] = useState<TableState>(EMPTY_TABLE_STATE);
    const [documentTable, setDocumentTable] = useState<TableState>(EMPTY_TABLE_STATE);

    function handleSearch(name: string) {
        if (name === "todo") {
            setTodoTable((prev) => ({
                ...prev,
                document_list: filterDocuments(TODO_DOCUMENTS, prev),
                status: true,
            }));
            return;
        }

        if (name === "create") {
            setCreateTable((prev) => ({
                ...prev,
                document_list: filterDocuments(MY_DOCUMENTS, prev),
                status: true,
            }));
            return;
        }

        setDocumentTable((prev) => ({
            ...prev,
            document_list: filterDocuments(ALL_DOCUMENTS, prev),
            status: true,
        }));
    }

    return (
        <div className="bg-slate-50 min-h-screen h-full w-full p-6">
            <div className='flex justify-between items-center'>
                <div className="">
                    <h1 className="text-2xl font-bold mb-4">Document Dashboard</h1>
                    <span>{"Manage and track all organizational documents"}</span>
                </div>
                <Link href={'/document_list'}>
                    <div className='text-white p-2 bg-[#1b1b1b] rounded-md flex justify-between items-center gap-1'>
                        <Icon icon={"ic:baseline-plus"} className='text-lg' />
                        <span>{"สร้างเอกสารใหม่"}</span>
                    </div>
                </Link>
            </div>

            <div className="flex flex-col rounded-xl border overflow-hidden mt-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                {/* Table toolbar */}
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                    <h2 style={{ color: "var(--foreground)" }} className='font-bold'>{"เอกสารที่คุณมีความเกี่ยวข้อง"}</h2>
                    <div className="flex justify-end items-center gap-2 w-3/4">
                        {todoTable.status && (
                            <button className='border rounded p-1.5 flex items-center hover:cursor-pointer' onClick={() => setTodoTable(EMPTY_TABLE_STATE)}>
                                <BrushCleaning size={"20px"} />
                            </button>
                        )}
                        <div
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border w-1/4"
                            style={{ borderColor: "var(--border)", background: "var(--input-background)" }}
                        >
                            <Icon icon="tabler:search" className="text-[14px]" style={{ color: "var(--muted-foreground)" }} />
                            <input
                                placeholder="Search documents…"
                                className="bg-transparent outline-none w-48"
                                style={{ fontSize: "0.8rem", color: "var(--foreground)" }}
                                value={todoTable.text}
                                onChange={(e) => setTodoTable(prev => ({ ...prev, text: e.target.value }))}
                            />
                        </div>

                        <div className='w-1/4 flex gap-10'>
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
                                        {DEPARTMENT_OPTIONS.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='w-1/4 flex gap-10'>
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
                                        {COMPANY_OPTIONS.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <button onClick={() => handleSearch("todo")} className='bg-[#4A4DF1] text-white px-2 py-1 rounded-md hover:cursor-pointer'>{"ค้นหา"}</button>
                        </div>
                    </div>
                </div>
                <div className=''>
                    <DataTable columns={columns} data={todoTable.status ? todoTable.document_list : TODO_DOCUMENTS} />
                </div>
                {/* Table */}
                {/* <Table>
                    <TableHeader>
                        <TableRow>
                            {headerTable.map((header) => (
                                <TableHead key={header} className="bg-[#F5F5F5]">
                                    {header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.map((document) => (
                            <TableRow key={document.id}>
                                <TableCell className="font-medium text-[#496aff]">{document.id}</TableCell>
                                <TableCell>{document.title}</TableCell>
                                <TableCell>{document.type}</TableCell>
                                <TableCell>{document.owner}</TableCell>
                                <TableCell>{document.department}</TableCell>
                                <TableCell>
                                    <StatusBadge status={document.status} />
                                </TableCell>
                                <TableCell>{document.updated}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table> */}

                {/* Pagination */}
                {/* <div
                    className="flex items-center justify-between px-5 py-3 border-t"
                    style={{ borderColor: "var(--border)", background: "var(--secondary)" }}
                >
                    <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                        Showing 1–8 of 1,284 documents
                    </span>
                    <div className="flex items-center gap-1">
                        {["1", "2", "3", "…", "161"].map((p) => (
                            <button
                                key={p}
                                className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                                style={{
                                    fontSize: "0.78rem",
                                    background: p === "1" ? "var(--primary)" : "transparent",
                                    color: p === "1" ? "var(--primary-foreground)" : "var(--muted-foreground)",
                                    fontWeight: p === "1" ? 600 : 400,
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div> */}
            </div>
            <div className="mt-6 flex gap-4">
                <Card className="w-1/4" >
                    <CardHeader>
                        <CardTitle>{"Totals Documents"}</CardTitle>
                        <CardAction>
                            <div className="bg-[#d3e8ff] rounded-lg p-2">
                                <Icon icon="carbon:document" className="text-lg text-[#007bff]" />
                            </div>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{1284}</p>
                    </CardContent>
                </Card>
                <Card className="w-1/4" >
                    <CardHeader>
                        <CardTitle>{"Approved Documents"}</CardTitle>
                        <CardAction>
                            <div className="bg-[#d3ffd9] rounded-lg p-2">
                                <Icon icon="material-symbols:check-box-outline" className="text-lg text-[#00b318]" />
                            </div>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{834}</p>
                    </CardContent>
                </Card>
                <Card className="w-1/4" >
                    <CardHeader>
                        <CardTitle>{"Processing Documents"}</CardTitle>
                        <CardAction>
                            <div className="bg-[#fcffd3] rounded-lg p-2">
                                <Icon icon="tabler:clock" className="text-lg text-[#c8d600]" />
                            </div>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{139}</p>
                    </CardContent>
                </Card>
                <Card className="w-1/4" >
                    <CardHeader>
                        <CardTitle>{"Cancelled Documents"}</CardTitle>
                        <CardAction>
                            <div className="bg-[#ffd3d3] rounded-lg p-2">
                                <Icon icon="material-symbols:error-outline-rounded" className="text-lg text-[#d60000]" />
                            </div>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{24}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col rounded-xl border overflow-hidden mt-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                {/* Table toolbar */}
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                    <h2 style={{ color: "var(--foreground)" }} className='font-bold'>{"เอกสารที่สร้าง"}</h2>
                    <div className="flex justify-end items-center gap-2 w-3/4">
                        {createTable.status && (
                            <button className='border rounded p-1.5 flex items-center hover:cursor-pointer' onClick={() => setCreateTable(EMPTY_TABLE_STATE)}>
                                <BrushCleaning size={"20px"} />
                            </button>
                        )}
                        <div
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border w-1/4"
                            style={{ borderColor: "var(--border)", background: "var(--input-background)" }}
                        >
                            <Icon icon="tabler:search" className="text-[14px]" style={{ color: "var(--muted-foreground)" }} />
                            <input
                                placeholder="Search documents…"
                                className="bg-transparent outline-none w-48"
                                style={{ fontSize: "0.8rem", color: "var(--foreground)" }}
                                value={createTable.text}
                                onChange={(e) => setCreateTable(prev => ({ ...prev, text: e.target.value }))}
                            />
                        </div>

                        <div className='w-1/4 flex gap-10'>
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
                                        {DEPARTMENT_OPTIONS.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='w-1/4 flex gap-10'>
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
                                        {COMPANY_OPTIONS.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <button onClick={() => handleSearch("create")} className='bg-[#4A4DF1] text-white px-2 py-1 rounded-md hover:cursor-pointer'>{"ค้นหา"}</button>
                        </div>
                    </div>
                </div>
                <div className=''>
                    <DataTable columns={columns} data={createTable.status ? createTable.document_list : MY_DOCUMENTS} />
                </div>
                {/* Table */}
                {/* <Table>
                    <TableHeader>
                        <TableRow>
                            {headerTable.map((header) => (
                                <TableHead key={header} className="bg-[#F5F5F5]">
                                    {header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.map((document) => (
                            <TableRow key={document.id}>
                                <TableCell className="font-medium text-[#496aff]">{document.id}</TableCell>
                                <TableCell>{document.title}</TableCell>
                                <TableCell>{document.type}</TableCell>
                                <TableCell>{document.owner}</TableCell>
                                <TableCell>{document.department}</TableCell>
                                <TableCell>
                                    <StatusBadge status={document.status} />
                                </TableCell>
                                <TableCell>{document.updated}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table> */}

                {/* Pagination */}
                {/* <div
                    className="flex items-center justify-between px-5 py-3 border-t"
                    style={{ borderColor: "var(--border)", background: "var(--secondary)" }}
                >
                    <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                        Showing 1–8 of 1,284 documents
                    </span>
                    <div className="flex items-center gap-1">
                        {["1", "2", "3", "…", "161"].map((p) => (
                            <button
                                key={p}
                                className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                                style={{
                                    fontSize: "0.78rem",
                                    background: p === "1" ? "var(--primary)" : "transparent",
                                    color: p === "1" ? "var(--primary-foreground)" : "var(--muted-foreground)",
                                    fontWeight: p === "1" ? 600 : 400,
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div> */}
            </div>

            <div className="flex flex-col rounded-xl border overflow-hidden mt-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                {/* Table toolbar */}
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                    <h2 style={{ color: "var(--foreground)" }} className='font-bold'>{"เอกสารทั้งหมด"}</h2>
                    <div className="flex justify-end items-center gap-2 w-3/4">
                        {documentTable.status && (
                            <button className='border rounded p-1.5 flex items-center hover:cursor-pointer' onClick={() => setDocumentTable(EMPTY_TABLE_STATE)}>
                                <BrushCleaning size={"20px"} />
                            </button>
                        )}
                        <div
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border w-1/4"
                            style={{ borderColor: "var(--border)", background: "var(--input-background)" }}
                        >
                            <Icon icon="tabler:search" className="text-[14px]" style={{ color: "var(--muted-foreground)" }} />
                            <input
                                placeholder="Search documents…"
                                className="bg-transparent outline-none w-48"
                                style={{ fontSize: "0.8rem", color: "var(--foreground)" }}
                                value={documentTable.text}
                                onChange={(e) => setDocumentTable(prev => ({ ...prev, text: e.target.value }))}
                            />
                        </div>

                        <div className='w-1/4 flex gap-10'>
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
                                        {DEPARTMENT_OPTIONS.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='w-1/4 flex gap-10'>
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
                                        {COMPANY_OPTIONS.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <button onClick={() => handleSearch("document")} className='bg-[#4A4DF1] text-white px-2 py-1 rounded-md hover:cursor-pointer'>{"ค้นหา"}</button>
                        </div>
                    </div>
                </div>
                <div className=''>
                    <DataTable columns={columns} data={documentTable.status ? documentTable.document_list : EMPTY_DOCUMENTS} />
                </div>
            </div>
        </div>
    );
}
