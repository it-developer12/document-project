"use client";

import { cancelByRequester } from "@/api/document";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type CancelByRequesterError = {
  message?: string;
};

type CancelByRequesterResponse = {
  message?: string;
};

export function useCancelByRequester() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: cancelByRequester,
    onSuccess: async (data: CancelByRequesterResponse, documentCode) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["document"],
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: ["document-detail", documentCode],
          refetchType: "all",
        }),
      ]);
      toast.success(data.message ?? "ยกเลิกเอกสารสำเร็จ");
      router.push("/dashboard");
    },
    onError: (error: AxiosError<CancelByRequesterError>) => {
      toast.error(
        error.response?.data?.message ??
          error.message ??
          "ไม่สามารถยกเลิกเอกสารได้",
      );
    },
  });
}
