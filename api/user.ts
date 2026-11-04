import { api } from "@/lib/axios";

export interface UpdateUserPayload {
    title?: string;
    firstName?: string;
    lastName?: string;
    firstNameEn?: string;
    lastNameEn?: string;
    email?: string;
    assignTo?: string;
    companyId?: string;
    role?: string;
    status?: boolean;
    position_name?: string;
    division_code?: string;
    department_name?: string;
}

export interface CreateUserPayload {
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
}

export async function getAllEmployees() {
    const response = await api.get(`/users/employee`);
    return response.data;
}

export async function updateUser(
    userId: string,
    userData: UpdateUserPayload | FormData,
) {
    const response = await api.patch(`/users/update/${userId}`, userData);
    return response.data;
}

export async function updateUserByAdmin(
    code: string,
    userData: UpdateUserPayload | FormData,
) {
    const response = await api.patch(`/users/update-by-admin/${code}`, userData);
    return response.data;
}

export async function createByAdmin(userData: CreateUserPayload) {
    const response = await api.post("/users/create-user", userData);
    return response.data;
}