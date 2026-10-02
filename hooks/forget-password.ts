import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { forgotPasswordApi } from "@/api/auth";
import { toast } from "react-toastify";

type ForgotPasswordResponse = {
    message?: string;
};

type ForgotPasswordErrorResponse = {
    message?: string;
};

type ForgotPasswordSuccessResult =
    | ForgotPasswordResponse
    | { data?: ForgotPasswordResponse };

export function useForgotPassword() {
    return useMutation({
        mutationFn: (data: { userName: string; code: string }) =>
            forgotPasswordApi(data.userName, data.code),

        onSuccess: (response: ForgotPasswordSuccessResult) => {
            const successMessage =
                typeof response === "object" && response !== null && "message" in response
                    ? response.message
                    : typeof response === "object" && response !== null && "data" in response
                        ? response.data?.message
                        : undefined;

            toast.success(successMessage ?? "อีเมลรีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลของคุณแล้ว");
        },

        onError: (error: AxiosError<ForgotPasswordErrorResponse>) => {
            const errorMessage =
                error.response?.data?.message ??
                error.message ??
                "ไม่สามารถส่งข้อมูลรีเซ็ตรหัสผ่านได้";

            toast.error(errorMessage);
        },
    });
}