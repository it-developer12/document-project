"use client";

import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { registerApi, type RegisterRequest } from "@/api/auth";
import { toast } from "react-toastify";

type RegisterErrorResponse = {
    message?: string;
};

export function useRegister(
    setIsRegistering: React.Dispatch<React.SetStateAction<boolean>>
) {
    return useMutation({
        mutationFn: (data: RegisterRequest) => registerApi(data),

        onSuccess: () => {
            setIsRegistering(false)
            toast.success('สมัครสมาชิกเรียบร้อย')
        },

        onError: (error: AxiosError<RegisterErrorResponse>) => {
            const errorMessage = error.response?.data.message ?? ""
            toast.error(errorMessage)
        },
    });
}
