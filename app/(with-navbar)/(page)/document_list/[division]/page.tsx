"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  FileText,
  Search,
  X,
} from "lucide-react";
import { useFormStore } from "@/store/form.store";
import { useGetAllPublishForms } from "@/hooks/set-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Page() {
  const params = useParams<{ division: string }>();
  const division = params?.division;
  const {
    mutate: loadPublishedForms,
    isPending,
    isError,
  } = useGetAllPublishForms();
  const forms = useFormStore((state) => state.publish_form);
  const [searchTerm, setSearchTerm] = useState("");
  const currentDivision = forms.find((item) => item.division_code === division);
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const visibleForms =
    currentDivision?.forms.filter((form) =>
      (form.name || "").toLocaleLowerCase().includes(normalizedSearch),
    ) ?? [];

  useEffect(() => {
    loadPublishedForms();
  }, [division, loadPublishedForms]);

  const divisionTitle =
    currentDivision?.division_name === "-"
      ? "เอกสารสำหรับทุกแผนก"
      : currentDivision?.division_name ?? "รายการเอกสาร";

  return (
    <main className="min-h-screen w-full bg-slate-50 px-2 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/document_list"
          aria-label="กลับไปหน้ารายการแผนก"
          className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
        </Link>

        <header className="mb-7">
          <p className="text-sm font-semibold text-indigo-600">
            คลังเอกสาร
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {divisionTitle}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            เลือกรูปแบบเอกสารที่ต้องการสร้าง
          </p>
        </header>

        {!isError && (
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                type="search"
                aria-label="ค้นหาเอกสาร"
                placeholder="ค้นหาชื่อเอกสาร..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-11 rounded-xl border-slate-200 bg-white pl-9 pr-10 shadow-sm focus-visible:border-indigo-400 focus-visible:ring-indigo-400/20"
              />
              {searchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  aria-label="ล้างคำค้นหา"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-1 top-1/2 size-9 -translate-y-1/2 p-0 text-slate-400 hover:text-slate-700"
                >
                  <X aria-hidden="true" className="size-4" />
                </Button>
              )}
            </div>
            {!isPending && currentDivision && (
              <p
                className="text-sm text-slate-500"
                aria-live="polite"
              >
                {normalizedSearch
                  ? `พบ ${visibleForms.length} จาก ${currentDivision.forms.length} รายการ`
                  : `เอกสารทั้งหมด ${currentDivision.forms.length} รายการ`}
              </p>
            )}
          </div>
        )}

        {isPending ? (
          <div
            className="grid gap-3 sm:grid-cols-2"
            aria-label="กำลังโหลดเอกสาร"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm">
            <p className="font-semibold text-slate-900">
              ไม่สามารถโหลดรายการเอกสารได้
            </p>
            <p className="mt-1 text-sm text-slate-500">
              กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง
            </p>
            <Button
              type="button"
              onClick={() => loadPublishedForms()}
              className="mt-5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              ลองอีกครั้ง
            </Button>
          </div>
        ) : !currentDivision ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <FileText
              aria-hidden="true"
              className="mx-auto size-10 text-slate-300"
            />
            <p className="mt-3 font-semibold text-slate-900">
              ไม่พบรายการเอกสารของแผนกนี้
            </p>
            <p className="mt-1 text-sm text-slate-500">
              กลับไปเลือกแผนกอื่น หรือลองโหลดหน้าอีกครั้ง
            </p>
          </div>
        ) : visibleForms.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <Search
              aria-hidden="true"
              className="mx-auto size-10 text-slate-300"
            />
            <p className="mt-3 font-semibold text-slate-900">
              {normalizedSearch
                ? "ไม่พบเอกสารที่ตรงกับคำค้นหา"
                : "ยังไม่มีเอกสารที่เผยแพร่"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {normalizedSearch
                ? "ลองค้นหาด้วยคำอื่น หรือล้างคำค้นหา"
                : "เอกสารที่พร้อมใช้งานจะแสดงที่นี่"}
            </p>
            {normalizedSearch && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setSearchTerm("")}
                className="mt-5 rounded-lg"
              >
                ล้างคำค้นหา
              </Button>
            )}
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {visibleForms.map((form) => (
              <li key={form.code}>
                <Link
                  href={`/document_list/${division}/form?schema_id=${form.code}&mode=create`}
                  className="group flex min-h-24 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:p-5"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                    <FileText aria-hidden="true" className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-800 group-hover:text-indigo-700">
                      {form.name || "ไม่มีชื่อเอกสาร"}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      คลิกเพื่อสร้างเอกสาร
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-5 shrink-0 text-slate-400 transition group-hover:text-indigo-600"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
