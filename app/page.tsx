"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useLogin } from "@/hooks/user-login";
import { useRegister } from "@/hooks/user-register";

export default function Home() {
    const [isRegistering, setIsRegistering] = useState(false);

    const router = useRouter();
    const loginMutation = useLogin();
    const registerMutation = useRegister(setIsRegistering);

    const [userName, setUsername] = useState("");
    const [passWord, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [registerMessage, setRegisterMessage] = useState("");

    const hasAccessToken = (() => {
        try {
            const cookieValue = document.cookie
                .split("; ")
                .find((cookie) => cookie.startsWith("access_token="));

            if (cookieValue) return true;

            return Boolean(window.localStorage.getItem("access_token"));
        } catch {
            return false;
        }
    })();

    useEffect(() => {
        if (hasAccessToken) {
            router.replace("/dashboard");
        }
    }, [hasAccessToken, router]);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isRegistering) {
            registerMutation.mutate(
                {
                    userName,
                    passWord,
                    code,
                },
                {
                    onSuccess: () => {
                        setIsRegistering(false);
                        setRegisterMessage("Registration successful. Please log in.");
                        setPassword("");
                        setCode("");
                    },
                },
            );
            return;
        }

        loginMutation.mutate({
            userName,
            passWord,
        });
    }

    if (hasAccessToken) {
        return null;
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
                                Document & workflow management
                            </h1>
                        </div>

                        {/* <div className="relative z-10 space-y-4 text-sm text-indigo-100/90">
                            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-base font-semibold text-white shadow-inner shadow-white/10">
                                    ✓
                                </div>
                                <span>Track document status and approvals in real time</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-base font-semibold text-white shadow-inner shadow-white/10">
                                    ⚡
                                </div>
                                <span>Faster process routing across teams</span>
                            </div>
                        </div> */}
                    </div>

                    <div className="relative flex items-center justify-center p-5 sm:p-8 lg:p-12">
                        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
                            <div className="space-y-2 text-center lg:text-left">
                                <p className="text-xs font-semibold uppercase text-[#4A4DF1]">
                                    {isRegistering ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
                                </p>
                                <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-900">
                                    {isRegistering ? "สร้างบัญชีใหม่" : "ยินดีต้อนรับ"}
                                </h2>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label htmlFor="username" className="flex items-center gap-1 text-sm font-medium text-slate-700">
                                        <span>{"ชื่อผู้ใช้"}</span>
                                        <span className="text-red-500">{"*"}</span>
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3.5 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#4A4DF1] focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                        value={userName}
                                        onChange={(event) => setUsername(event.target.value)}
                                        autoComplete="username"
                                        placeholder={isRegistering ? "กรอกชื่อผู้ใช้" : "กรอกรหัสพนักงาน"}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="password" className="flex items-center gap-1 text-sm font-medium text-slate-700">
                                        <span>{"รหัสผ่าน"}</span>
                                        <span className="text-red-500">{"*"}</span>
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3.5 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#4A4DF1] focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                        value={passWord}
                                        onChange={(event) => setPassword(event.target.value)}
                                        autoComplete={isRegistering ? "new-password" : "current-password"}
                                        placeholder="กรอกรหัสผ่าน"
                                        required
                                    />
                                </div>

                                {isRegistering && (
                                    <div className="space-y-2">
                                        <label htmlFor="code" className="flex items-center gap-1 text-sm font-medium text-slate-700">
                                            <span>{"รหัสพนักงาน"}</span>
                                            <span className="text-red-500">{"*"}</span>
                                        </label>
                                        <input
                                            id="code"
                                            name="code"
                                            type="text"
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-3.5 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#4A4DF1] focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                            value={code}
                                            onChange={(event) => setCode(event.target.value)}
                                            placeholder="กรอกรหัสยืนยัน"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 pt-2">
                                <button
                                    type="submit"
                                    className="flex w-full items-center justify-center rounded-2xl bg-[#4A4DF1] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(74,77,241,0.28)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#3d43d8] focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-70"
                                    disabled={loginMutation.isPending || registerMutation.isPending}
                                >
                                    {isRegistering
                                        ? registerMutation.isPending
                                            ? "Registering..."
                                            : "Register"
                                        : loginMutation.isPending
                                          ? "Signing in..."
                                          : "Login"}
                                </button>

                                <button
                                    type="button"
                                    className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                                    onClick={() => {
                                        setIsRegistering((current) => !current);
                                        setRegisterMessage("");
                                    }}
                                >
                                    {isRegistering ? "กลับเข้าสู่ระบบ" : "สมัครสมาชิก"}
                                </button>
                            </div>

                            {registerMessage && (
                                <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700 shadow-sm">
                                    {registerMessage}
                                </p>
                            )}

                            {registerMutation.isError && (
                                <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 shadow-sm">
                                    {registerMutation.error.response?.data?.message ?? "ไม่สามารถสมัครสมาชิกได้"}
                                </p>
                            )}

                            {loginMutation.isError && (
                                <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 shadow-sm">
                                    {"รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง"}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}