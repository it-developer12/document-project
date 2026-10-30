"use client";

import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { updateUser, type UpdateUserPayload } from "@/api/user";

type UpdateUserVariables = {
  userId: string;
  userData: UpdateUserPayload | FormData;
};

type UpdateUserError = {
  message?: string;
};

export function useUpdateUserInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, userData }: UpdateUserVariables) =>
      updateUser(userId, userData),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["me"] }),
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
      ]);
      toast.success("อัปเดตข้อมูลผู้ใช้สำเร็จ");
    },
    onError: (error: AxiosError<UpdateUserError>) => {
      toast.error(
        error.response?.data?.message ??
          error.message ??
          "Could not update user information.",
      );
    },
  });
}