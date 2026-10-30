import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_26%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_42%,_#e2e8f0_100%)] px-4 py-10">
      <div
        aria-hidden="true"
        className="absolute -left-24 top-1/4 size-72 rounded-full bg-indigo-200/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-20 bottom-1/4 size-72 rounded-full bg-sky-200/30 blur-3xl"
      />

      <section className="relative w-full max-w-xl rounded-[28px] border border-white/80 bg-white/80 p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-indigo-50 text-[#4A4DF1] ring-1 ring-indigo-100">
          <FileQuestion aria-hidden="true" className="size-8" />
        </div>

        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.24em] text-[#4A4DF1]">
          Docflow · 404
        </p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          ไม่พบหน้านี้
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          หน้าที่คุณกำลังค้นหาอาจถูกย้าย เปลี่ยนชื่อ หรือไม่มีอยู่ในระบบ
          ลองกลับไปยังหน้าหลักแล้วเลือกเมนูที่ต้องการอีกครั้ง
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#4A4DF1] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          กลับไปหน้าหลัก
        </Link>
      </section>
    </main>
  );
}
