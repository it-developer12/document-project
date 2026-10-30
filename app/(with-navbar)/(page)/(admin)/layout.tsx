"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/app/component/loading";
import { useAuthStore } from "@/store/auth.store";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.user_info.role === "ADMIN";

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAdmin, router, user]);

  if (!user || !isAdmin) {
    return <Loading />;
  }

  return children;
}