"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

import { getMe, loginApi, type LoginRequest } from "@/api/auth";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "react-toastify";

type LoginErrorResponse = {
  message?: string;
};

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: LoginRequest) => loginApi(data),

    onSuccess: async () => {
      const user = await getMe();

      setUser(user);
      queryClient.setQueryData(["auth", "me"], user);

      router.replace("/dashboard");
    },

    onError: (error: AxiosError<LoginErrorResponse>) => {
      const message = error.response?.data?.message || error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
      console.error("Login failed:", message);
      toast.error(message);
    },
  });
}