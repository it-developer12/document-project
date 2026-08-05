"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

import { getMe, loginApi, type LoginRequest } from "@/api/auth";
import { useAuthStore } from "@/store/auth.store";

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
      console.log(user)

      setUser(user);
      queryClient.setQueryData(["auth", "me"], user);

      router.replace("/dashboard");
    },

    onError: (error: AxiosError<LoginErrorResponse>) => {
      console.log(
        "Login failed:",
        error.response?.data?.message ?? error.message,
      );
    },
  });
}