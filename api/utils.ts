import { api } from "@/lib/axios";

export async function getDivisionList() {
    const response = await api.get('/utils/division');
    return response.data;
}

export async function getCompanyList() {
    const response = await api.get('/utils/company');
    return response.data;
}

export async function getEmployeeList() {
    const response = await api.get('/utils/employee');
    return response.data;
}