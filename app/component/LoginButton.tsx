"use client"

import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

export default function LoginButton() {
    const router = useRouter()
    function changePage(link: string){
        router.push(link)
        toast.success("เข้าสู่ระบบสำเร็จ")
    }
    return (
        <button className="w-full bg-[#4A4DF1] text-white p-2 rounded hover:cursor-pointer" onClick={() => changePage("/dashboard")}>
            Login with Keycloak
        </button>
    )
}