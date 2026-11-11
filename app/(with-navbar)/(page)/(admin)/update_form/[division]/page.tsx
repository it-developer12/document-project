"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  FileText,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useFormStore } from "@/store/form.store";
import { useGetForms } from "@/hooks/set-form";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useDeactivateTemplate } from "@/hooks/update-template";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type FormToDeactivate = {
  code: string;
  name: string;
};

export default function Page() {
  const params = useParams<{ division: string }>();
  const division = params?.division;
  const { mutate: loadForms, isPending, isError } = useGetForms();
  const { data: currentUser } = useCurrentUser();
  const deactivateTemplate = useDeactivateTemplate();
  const isSuperAdmin = currentUser?.user_info?.role === "SUPER_ADMIN";
  const forms = useFormStore((state) => state.forms);
  const [searchTerm, setSearchTerm] = useState("");
  const [formToDeactivate, setFormToDeactivate] =
    useState<FormToDeactivate | null>(null);
  const currentDivision = forms.find(
    (item) => item.division_code === division,
  );
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const visibleForms =
    currentDivision?.forms.filter((form) =>
      (form.name || "").toLocaleLowerCase().includes(normalizedSearch),
    ) ?? [];

  useEffect(() => {
    loadForms();
  }, [division, loadForms]);

  const divisionTitle =
    currentDivision?.division_name === "-"
      ? "เอกสารสำหรับทุกแผนก"
      : currentDivision?.division_name ?? "รายการเอกสาร";

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/update_form"
          aria-label="กลับไปหน้ารายการแผนก"
          className="mb-6 inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
        </Link>

        <header className="mb-7">
          <p className="text-sm font-semibold text-indigo-600">
            จัดการเอกสาร
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {divisionTitle}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            ค้นหาและเลือกแบบฟอร์มที่ต้องการแก้ไข
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
              <p className="text-sm text-slate-500" aria-live="polite">
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
              onClick={() => loadForms()}
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
                : "ยังไม่มีแบบฟอร์มในแผนกนี้"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {normalizedSearch
                ? "ลองค้นหาด้วยคำอื่น หรือล้างคำค้นหา"
                : "แบบฟอร์มในแผนกนี้จะแสดงที่นี่"}
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
                <div className="flex min-h-24 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md sm:p-5">
                  <Link
                    href={`/update_form/${division}/edit?schema_id=${form.code}&draft=${String(form.is_draft)}`}
                    className="group flex min-w-0 flex-1 items-center gap-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                      <FileText aria-hidden="true" className="size-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-slate-800 group-hover:text-indigo-700">
                        {form.name || "ไม่มีชื่อเอกสาร"}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {form.is_draft ? "ฉบับร่าง · คลิกเพื่อแก้ไข" : "เผยแพร่แล้ว · คลิกเพื่อแก้ไข"}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        form.is_draft
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {form.is_draft ? "ฉบับร่าง" : "เผยแพร่"}
                    </span>
                    {/* <ArrowUpRight
                      aria-hidden="true"
                      className="size-5 shrink-0 text-slate-400 transition group-hover:text-indigo-600"
                    /> */}
                  </Link>
                  {isSuperAdmin && !form.is_draft && (
                    <Button
                      type="button"
                      variant="ghost"
                      aria-label={`ปิดใช้งานแบบฟอร์ม ${form.name || form.code}`}
                      title="ปิดใช้งานแบบฟอร์ม"
                      disabled={deactivateTemplate.isPending}
                      onClick={() => setFormToDeactivate({
                        code: form.code,
                        name: form.name || form.code,
                      })}
                      className="size-10 shrink-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                    >
                      <Trash2 aria-hidden="true" className="size-5" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Dialog
        open={formToDeactivate !== null}
        onOpenChange={(open) => {
          if (!open && !deactivateTemplate.isPending) {
            setFormToDeactivate(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการปิดใช้งานแบบฟอร์ม</DialogTitle>
            <DialogDescription>
              คุณต้องการปิดใช้งานแบบฟอร์ม “{formToDeactivate?.name}” ใช่หรือไม่?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deactivateTemplate.isPending}
              onClick={() => setFormToDeactivate(null)}
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deactivateTemplate.isPending || !formToDeactivate}
              onClick={() => {
                if (!formToDeactivate) return;
                deactivateTemplate.mutate(formToDeactivate.code, {
                  onSuccess: () => setFormToDeactivate(null),
                });
              }}
            >
              {deactivateTemplate.isPending ? "กำลังปิดใช้งาน..." : "ยืนยันปิดใช้งาน"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
