import { api } from "@/lib/axios";

export type CompanyRecord = {
    code: string;
    name: string;
    logo: string | null;
};

export type DivisionRecord = {
    code: string;
    name: string;
};

export type DepartmentRecord = {
    code: string;
    name: string;
};

export type PositionRecord = {
    name: string;
    department: {
        name: string;
    },
    division: {
        name: string;
        code: string;
    }
};

export type EmployeeRecord = {
    employee_code: string;
    fullName: string;
    firstName: string;
    lastName: string;
    role: string;
    position: PositionRecord;
    company: {
        name: string;
    };
};

export type updateDepartmentPayload = {
    code: string;
    name: string;
}

export type updateDivisionPayload = {
    code: string;
    name: string;
}

export type updatePositionPayload = {
    old_position: {
        position_name: string;
        division_code: string;
        department_name: string;
    },
    new_position: {
        position_name: string;
        division_code: string;
        department_name: string;
    }
}

export type CreateDepartmentPayload = {
    name: string;
}

export type CreateDivisionPayload = {
    name: string;
    code: string;
}

export type CreatePositionPayload = {
    position_name: string;
    division_code: string;
    department_name: string;
}

export type CreateCompanyPayload = {
    code: string;
    name: string;
    name_en?: string;
}

export type DeletePositionPayload = {
    position_name: string;
    division_code: string;
    department_name: string;
}

export async function getDivisionList(): Promise<DivisionRecord[]> {
    const response = await api.get<DivisionRecord[]>('/utils/division');
    return response.data;
}

export async function getCompanyList(): Promise<CompanyRecord[]> {
    const response = await api.get<CompanyRecord[]>('/utils/company');
    return response.data;
}

export async function getEmployeeList(): Promise<EmployeeRecord[]> {
    const response = await api.get<EmployeeRecord[]>('/utils/employee');
    return response.data;
}

export async function getDepartmentList(): Promise<DepartmentRecord[]> {
    const response = await api.get<DepartmentRecord[]>('/utils/department');
    return response.data;
}

export async function getPositionList(): Promise<PositionRecord[]> {
    const response = await api.get<PositionRecord[]>('/utils/position');
    return response.data;
}

export async function updateCompany(companyId: string, companyData: FormData) {
    const response = await api.patch(`/utils/company/${companyId}`, companyData);
    return response.data;
}

export async function updateDepartment(name:string, data: updateDepartmentPayload) {
    const response = await api.patch(`/utils/department/${name}`, data);
    return response.data
}

export async function updateDivision(code:string, data: updateDivisionPayload) {
    const response = await api.patch(`/utils/division/${code}`, data);
    return response.data
}

export async function updatePosition(name: string, data: updatePositionPayload) {
    const response = await api.patch(`/utils/position/${name}`, data);
    return response.data
}

export async function createDepartment(data: CreateDepartmentPayload) {
    const response = await api.post('/utils/department', data);
    return response.data;
}

export async function createCompany(companyData: FormData) {
    const response = await api.post(`/utils/company`, companyData);
    return response.data;
}

export async function createDivision(data: CreateDivisionPayload) {
    const response = await api.post(`/utils/division`, data);
    return response.data
}

export async function createPosition(data: CreatePositionPayload) {
    const response = await api.post(`/utils/position`, data);
    return response.data
}

export async function deleteDepartment(name: string) {
    const response = await api.delete(`/utils/department/${name}`)
    return response.data
}

export async function deleteDivision(code:string) {
    const response = await api.delete(`/utils/division/${code}`)
    return response.data
}

export async function deletePosition(name: string, data: DeletePositionPayload) {
    const response = await api.delete(`/utils/position/${name}`, { data });
    return response.data
}

export async function ExportPDF(code: string, disposition: "inline" | "attachment" = "attachment"): Promise<Blob> {
    const response = await api.get(`/documents/${code}/export/pdf?disposition=${disposition}`, { responseType: 'blob' });
    return response.data;
}
