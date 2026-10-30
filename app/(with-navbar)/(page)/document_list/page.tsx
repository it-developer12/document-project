'use client'

import Link from "next/link"
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Building2, FileText, Search, RotateCcw } from "lucide-react";
import { useGetForms } from "@/hooks/set-form";
import { useFormStore } from "@/store/form.store";

export default function Page() {
    const { mutate: loadForms, isPending, isError, isSuccess } = useGetForms();
    const forms = useFormStore((state) => state.forms);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadForms();
    }, [loadForms]);

    const filteredForms = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase();
        if (!normalizedSearch) return forms;

        return forms.filter((item) =>
            (item.division_name === "-" ? "เอกสารสำหรับทุกแผนก" : item.division_name)
                .toLocaleLowerCase()
                .includes(normalizedSearch),
        );
    }, [forms, search]);

    const isInitialLoading = isPending && forms.length === 0;
    const isEmpty = isSuccess && forms.length === 0;
    const hasNoSearchResults = !isPending && forms.length > 0 && filteredForms.length === 0;

    return (
        <main className="min-h-screen w-full bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                <header className="rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 px-6 py-8 text-white shadow-lg shadow-indigo-900/10 sm:px-9 sm:py-10">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-indigo-50">
                                <FileText size={16} aria-hidden="true" />
                                คลังเอกสาร
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                เลือกแผนกเพื่อเริ่มต้น
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-indigo-100 sm:text-base">
                                ค้นหาแผนกที่ต้องการ แล้วเลือกดูแบบฟอร์มเอกสารที่เกี่ยวข้อง
                            </p>
                        </div>
                        {forms.length > 0 && (
                            <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                                <span className="flex size-10 items-center justify-center rounded-xl bg-white/15">
                                    <Building2 size={20} aria-hidden="true" />
                                </span>
                                <span>
                                    <span className="block text-xl font-bold leading-6">{forms.length}</span>
                                    <span className="text-xs text-indigo-100">แผนก</span>
                                </span>
                            </div>
                        )}
                    </div>
                </header>

                <section aria-labelledby="departments-heading">
                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 id="departments-heading" className="text-lg font-semibold text-slate-900">
                                แผนกและแบบฟอร์ม
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {forms.length > 0
                                    ? `${forms.length} แผนกที่มีรายการเอกสาร`
                                    : "รายการแผนกที่มีแบบฟอร์มเอกสาร"}
                            </p>
                        </div>
                        {forms.length > 0 && (
                            <label className="relative block w-full sm:max-w-sm">
                                <span className="sr-only">ค้นหาแผนก</span>
                                <Search
                                    size={18}
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="ค้นหาชื่อแผนก..."
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                />
                            </label>
                        )}
                    </div>

                    {isInitialLoading ? (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }, (_, index) => (
                                <div
                                    key={index}
                                    className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                                    aria-hidden="true"
                                >
                                    <div className="size-11 rounded-xl bg-slate-100" />
                                    <div className="mt-5 h-4 w-2/3 rounded bg-slate-100" />
                                    <div className="mt-2 h-3 w-1/3 rounded bg-slate-100" />
                                </div>
                            ))}
                            <span className="sr-only" role="status">กำลังโหลดแผนก</span>
                        </div>
                    ) : isError && forms.length === 0 ? (
                        <div className="rounded-2xl border border-rose-200 bg-white px-6 py-12 text-center shadow-sm">
                            <p className="font-semibold text-slate-900">โหลดรายการแผนกไม่สำเร็จ</p>
                            <p className="mt-1 text-sm text-slate-500">โปรดลองอีกครั้ง</p>
                            <button
                                type="button"
                                onClick={() => loadForms()}
                                className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
                            >
                                <RotateCcw size={16} aria-hidden="true" />
                                ลองอีกครั้ง
                            </button>
                        </div>
                    ) : isEmpty ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                <FileText size={25} aria-hidden="true" />
                            </span>
                            <h3 className="mt-4 font-semibold text-slate-900">ยังไม่มีแบบฟอร์มเอกสาร</h3>
                            <p className="mt-1 text-sm text-slate-500">เมื่อมีแบบฟอร์มพร้อมใช้งาน รายการจะแสดงที่นี่</p>
                        </div>
                    ) : hasNoSearchResults ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                            <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                <Search size={21} aria-hidden="true" />
                            </span>
                            <h3 className="mt-4 font-semibold text-slate-900">ไม่พบแผนกที่ค้นหา</h3>
                            <p className="mt-1 text-sm text-slate-500">ลองตรวจสอบคำค้นหาหรือค้นหาด้วยชื่ออื่น</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredForms.map((item) => {
                                const departmentName = item.division_name === "-"
                                    ? "เอกสารสำหรับทุกแผนก"
                                    : item.division_name;
                                const draftCount = item.forms.filter((form) => form.is_draft).length;

                                return (
                                    <Link
                                        href={`/document_list/${item.division_code}`}
                                        key={item.division_code}
                                        className="group rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
                                    >
                                        <article className="flex h-full min-h-40 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:border-indigo-200 group-hover:shadow-lg group-hover:shadow-indigo-900/5">
                                            <div className="flex items-start justify-between gap-4">
                                                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-100">
                                                    <Building2 size={22} aria-hidden="true" />
                                                </span>
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                                    {item.forms.length} {item.forms.length === 1 ? "แบบฟอร์ม" : "แบบฟอร์ม"}
                                                </span>
                                            </div>
                                            <div className="mt-5 flex items-end justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="truncate text-base font-semibold text-slate-900">
                                                        {departmentName}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {draftCount > 0
                                                            ? `${item.forms.length - draftCount} พร้อมใช้งาน · ${draftCount} ฉบับร่าง`
                                                            : "ดูแบบฟอร์มเอกสาร"}
                                                    </p>
                                                </div>
                                                <ArrowRight
                                                    size={18}
                                                    aria-hidden="true"
                                                    className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600"
                                                />
                                            </div>
                                        </article>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}
