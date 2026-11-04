"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/app/component/loading";
import { useAuthStore } from "@/store/auth.store";

export default function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.user_info.role === "SUPER_ADMIN";

  useEffect(() => {
    if (user && !isSuperAdmin) {
      router.replace("/dashboard");
    }
  }, [isSuperAdmin, router, user]);

  if (!user || !isSuperAdmin) {
    return <Loading />;
  }

  return children;
}