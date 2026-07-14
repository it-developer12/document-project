'use client'

import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

export default function Home() {

    const router = useRouter()

    function changePage(link: string) {
        router.push(link)
        toast.success("เข้าสู่ระบบสำเร็จ")
    }
    return (
        <div className="w-full min-h-screen h-full flex justify-center bg-[#dddddd] items-center">
            <div className="max-w-1/3 w-full h-full bg- p-10 bg-white rounded-2xl shadow border">
                <div className="font-bold text-2xl flex flex-col justify-center items-center">
                    <span>{"Document & workflow management"}</span>
                </div>
                <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <span>{"รหัสพนักงาน "}</span><span className="text-red-500">{"*"}</span>
                        <input type="text" className="w-full border rounded px-2 py-1" />
                    </div>
                    <div>
                        <span>{"รหัสผ่าน "}</span><span className="text-red-500">{"*"}</span>
                        <input type="password" className="w-full border rounded px-2 py-1" />
                    </div>
                    <div className="space-y-2">
                        <button className="w-full bg-[#4A4DF1] text-white p-2 rounded hover:cursor-pointer" onClick={() => changePage("/dashboard")}>
                            Login with Keycloak
                        </button>
                        {/* <button className="w-full bg-[#4A4DF1] text-white p-2 rounded hover:cursor-pointer" onClick={() => changePage('/dashboard')}>{"เข้าสู่ระบบ"}</button> */}
                        <button className="w-full bg-black text-white p-2 rounded hover:cursor-pointer">{"ลืมรหัสผ่าน"}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}