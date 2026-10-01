import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { resetPasswordApi } from "@/api/auth";
import { toast } from "react-toastify";

type ResetPasswordResponse = {
    message?: string;
};

type ResetPasswordErrorResponse = {
    message?: string;
};

type ResetPasswordSuccessResult =
    | ResetPasswordResponse
    | { data?: ResetPasswordResponse };

export function useResetPassword() {
    return useMutation({
        mutationFn: (data: { userName: string; code: string; token: string; newPassword: string }) =>
            resetPasswordApi(data.userName, data.code, data.token, data.newPassword),

        onSuccess: (response: ResetPasswordSuccessResult) => {
            const successMessage =
                typeof response === "object" && response !== null && "message" in response
                    ? response.message
                    : typeof response === "object" && response !== null && "data" in response
                        ? response.data?.message
                        : undefined;

            toast.success(successMessage ?? "รีเซ็ตรหัสผ่านสำเร็จ");
        },

        onError: (error: AxiosError<ResetPasswordErrorResponse>) => {
            const errorMessage =
                error.response?.data?.message ??
                error.message ??
                "ไม่สามารถรีเซ็ตรหัสผ่านได้";

            toast.error(errorMessage);
        },
    });
}