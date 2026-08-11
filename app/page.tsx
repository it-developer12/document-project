"use client";
import { useLogin } from "@/hooks/user-login";
import LoginButton from "./component/LoginButton";
import { useForm } from "react-hook-form";
import { register } from "module";
import { useState, FormEvent } from "react";


export default function Home() {

    const loginMutation = useLogin();

    const [userName, setUsername] = useState("");
    const [passWord, setPassword] = useState("");

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        loginMutation.mutate({
            userName,
            passWord,
        });
    }


    return (
        <div className="w-full min-h-screen h-full flex justify-center bg-[#dddddd] items-center">
            <form onSubmit={handleSubmit} className="max-w-1/3 w-full h-full bg- p-10 bg-white rounded-2xl shadow border">
                <div className="font-bold text-2xl flex flex-col justify-center items-center">
                    <span>{"Document & workflow management"}</span>
                </div>
                <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <span>{"รหัสพนักงาน "}</span><span className="text-red-500">{"*"}</span>
                        <input
                            id="username"
                            type="text"
                            className="w-full border rounded px-2 py-1"
                            value={userName}
                            onChange={(event) => setUsername(event.target.value)}
                            autoComplete="username"
                            required
                        />
                    </div>
                    <div>
                        <span>{"รหัสผ่าน "}</span><span className="text-red-500">{"*"}</span>
                        <input className="w-full border rounded px-2 py-1"
                            id="password"
                            name="password"
                            type="password"
                            value={passWord}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <button type="submit" className="w-full bg-[#4A4DF1] text-white p-2 rounded hover:cursor-pointer" >
                            {loginMutation.isPending ? "Signing in..." : "Login with Keycloak"}
                        </button>
                        {/* <button className="w-full bg-[#4A4DF1] text-white p-2 rounded hover:cursor-pointer" onClick={() => changePage('/dashboard')}>{"เข้าสู่ระบบ"}</button> */}
                        <button className="w-full bg-black text-white p-2 rounded hover:cursor-pointer">{"ลืมรหัสผ่าน"}</button>
                    </div>
                    {loginMutation.isError && (
                        <p className="text-red-500">{"รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง"}</p>
                    )}
                </div>
            </form>
        </div>
    )
}