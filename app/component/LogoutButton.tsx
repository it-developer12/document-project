'use client'
import { logoutApi } from "@/api/auth";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

export function LogoutButton() {
    const router = useRouter();
    const clear = useAuthStore((s) => s.clearUser);

    async function ButtonClick() {
        await logoutApi();
        clear();
        router.push("/");
    }
    return(
        <button className="px-2 py-1 text-white bg-red-500 rounded-md" onClick={() => ButtonClick()}>
            <span>Logout</span>
        </button>
    )
}