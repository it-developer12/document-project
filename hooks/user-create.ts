"use client";

import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createByAdmin } from "@/api/user";

type CreateUserVariables = {
    code: string;
    title: string;
    firstName: string;
    firstNameEn: string;
    lastName: string;
    lastNameEn: string;
    email: string;
    role: "USER" | "ADMIN" | "SUPER_ADMIN";
    assignTo: string;
    position_name: string;
    companyId: string;
    level: number;
};

type CreateUserError = {
    message?: string;
};

export function useCreateUserByAdmin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData: CreateUserVariables) => createByAdmin(userData),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["all-employees"] });
            toast.success("สร้างผู้ใช้สำเร็จ");
        },
        onError: (error: AxiosError<CreateUserError>) => {
            toast.error(
                error.response?.data?.message ??
                error.message ??
                "Could not create user.",
            );
        },
    });
}