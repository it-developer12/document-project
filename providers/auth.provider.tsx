"use client";

import { useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAuthStore } from "@/store/auth.store";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isSuccess, isError } = useCurrentUser();

  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    if (isSuccess) setUser(data);

    if (isError) clearUser();
  }, [isSuccess, isError, data, setUser, clearUser]);

  return children;
}