import { api } from "@/lib/axios";

export interface UpdateUserPayload {
    title?: string;
    firstName?: string;
    lastName?: string;
    firstNameEn?: string;
    lastNameEn?: string;
    email?: string;
}

export async function updateUser(
    userId: string,
    userData: UpdateUserPayload | FormData,
) {
    const response = await api.patch(`/users/update/${userId}`, userData);
    return response.data;
}