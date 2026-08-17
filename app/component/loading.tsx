export default function Loading() {
  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_38%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_40%,_#e2e8f0_100%)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-4 rounded-[28px] border border-slate-200/80 bg-white/75 px-6 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border border-indigo-100" />
          <div
            className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[#4A4DF1] border-r-[#7c3aed]"
            aria-hidden="true"
          />
        </div>

        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">
            Loading
          </span>
          <span className="text-base font-medium text-slate-800">{"กรุณารอสักครู่"}</span>
        </div>
      </div>

      <span className="sr-only">{"กำลังโหลด"}</span>
    </div>
  );
}
