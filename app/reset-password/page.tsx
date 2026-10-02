"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useResetPassword } from "@/hooks/reset-password";
import { toast } from "react-toastify";

export default function ResetPasswordPage() {
    const param = useSearchParams();
    const token = param.get("token");
    const router = useRouter();
    const resetPasswordMutation = useResetPassword();
    const [userName, setUserName] = useState("");
    const [employeeCode, setEmployeeCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!token) {
            setError("ไม่พบ token สำหรับรีเซ็ตรหัสผ่าน");
            setSuccessMessage("");
            return;
        }

        if (!userName || !employeeCode || !newPassword || !confirmPassword) {
            setError("กรุณากรอกข้อมูลให้ครบถ้วน");
            setSuccessMessage("");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("รหัสผ่านไม่ตรงกัน");
            setSuccessMessage("");
            return;
        }

        setError("");
        resetPasswordMutation.mutate(
            {
                userName,
                code: employeeCode,
                token,
                newPassword,
            },
            {
                onSuccess: () => {
                    toast.success("รีเซ็ตรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
                    setUserName("");
                    setEmployeeCode("");
                    setNewPassword("");
                    setConfirmPassword("");
                    router.push("/");
                },
                onError: () => {
                    setSuccessMessage("");
                },
            },
        );
    }

    if (!token) {
        return (
            <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_26%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_42%,_#e2e8f0_100%)] px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-xl items-center justify-center">
                    <div className="w-full rounded-[30px] border border-slate-200 bg-white/80 p-8 shadow-[0_35px_90px_rgba(15,23,42,0.14)] backdrop-blur-xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4A4DF1]">Reset password</p>
                        <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-900">ไม่พบข้อมูล token</h2>
                        <p className="mt-4 text-sm text-slate-600">ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว กรุณากลับไปยังหน้าเข้าสู่ระบบ</p>
                        <button
                            type="button"
                            className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#4A4DF1] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(74,77,241,0.28)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#3d43d8]"
                            onClick={() => router.push("/")}
                        >
                            กลับสู่หน้าเข้าสู่ระบบ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_26%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_42%,_#e2e8f0_100%)] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
                <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/70 shadow-[0_35px_90px_rgba(15,23,42,0.14)] ring-1 ring-white/60 backdrop-blur-xl lg:grid-cols-[1.08fr_0.92fr]">
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.14),rgba(255,255,255,0))]" />

                    <div className="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,_#4A4DF1_0%,_#4f46e5_35%,_#1e293b_100%)] p-8 text-white lg:flex">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_35%)]" />

                        <div className="relative z-10">
                            <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-[0.28em] text-indigo-100 uppercase shadow-inner shadow-white/5">
                                Workflow Suite
                            </div>
                            <h1 className="max-w-sm text-4xl font-semibold leading-tight tracking-[-0.04em]">
                                Reset your password
                            </h1>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center p-5 sm:p-8 lg:p-12">
                        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
                            <div className="space-y-2 text-center lg:text-left">
                                <p className="text-xs font-semibold uppercase text-[#4A4DF1]">
                                    รีเซ็ตรหัสผ่าน
                                </p>
                                <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-900">
                                    ตั้งค่ารหัสผ่านใหม่
                                </h2>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label htmlFor="reset-username" className="flex items-center gap-1 text-sm font-medium text-slate-700">
                                        <span>{"ชื่อผู้ใช้ (username)"}</span>
                                        <span className="text-red-500">{"*"}</span>
                                    </label>
                                    <input
                                        id="reset-username"
                                        type="text"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3.5 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#4A4DF1] focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                        value={userName}
                                        onChange={(event) => setUserName(event.target.value)}
                                        autoComplete="username"
                                        placeholder="กรอกชื่อผู้ใช้"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="reset-employee-code" className="flex items-center gap-1 text-sm font-medium text-slate-700">
                                        <span>{"รหัสพนักงาน (employee code)"}</span>
                                        <span className="text-red-500">{"*"}</span>
                                    </label>
                                    <input
                                        id="reset-employee-code"
                                        type="text"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3.5 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#4A4DF1] focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                        value={employeeCode}
                                        onChange={(event) => setEmployeeCode(event.target.value)}
                                        autoComplete="off"
                                        placeholder="กรอกรหัสพนักงาน"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="new-password" className="flex items-center gap-1 text-sm font-medium text-slate-700">
                                        <span>{"รหัสผ่านใหม่"}</span>
                                        <span className="text-red-500">{"*"}</span>
                                    </label>
                                    <input
                                        id="new-password"
                                        type="password"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3.5 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#4A4DF1] focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                        autoComplete="new-password"
                                        placeholder="กรอกรหัสผ่านใหม่"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="confirm-password" className="flex items-center gap-1 text-sm font-medium text-slate-700">
                                        <span>{"ยืนยันรหัสผ่านใหม่"}</span>
                                        <span className="text-red-500">{"*"}</span>
                                    </label>
                                    <input
                                        id="confirm-password"
                                        type="password"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3.5 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#4A4DF1] focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        autoComplete="new-password"
                                        placeholder="กรอกรหัสผ่านอีกครั้ง"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <button
                                    type="submit"
                                    className="flex w-full items-center justify-center rounded-2xl bg-[#4A4DF1] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(74,77,241,0.28)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#3d43d8] focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    รีเซ็ตรหัสผ่าน
                                </button>

                                <button
                                    type="button"
                                    className="flex w-full items-center justify-center text-sm font-medium text-[#4A4DF1] transition hover:text-[#3d43d8]"
                                    onClick={() => router.push("/")}
                                >
                                    กลับสู่หน้าเข้าสู่ระบบ
                                </button>
                            </div>

                            {error && (
                                <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 shadow-sm">
                                    {error}
                                </p>
                            )}

                            {successMessage && (
                                <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700 shadow-sm">
                                    {successMessage}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
