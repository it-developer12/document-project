'use client'
import { useAuthStore } from "@/store/auth.store";
import { LogoutButton } from "../LogoutButton";

export default function UserNav () {
    const user = useAuthStore((state) => state.user);
    return (
        <div className="flex justify-between">
            <div className="flex items-center">
                <span className="text-white">{user?.user_info.firstName ?? "No first name"}</span>
            </div>
            <div className="flex items-center">
                <LogoutButton />
            </div>
        </div>
    )
}