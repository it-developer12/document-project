import { api } from "@/lib/axios";

type FormFieldCreate = {
    id: string
    type: string
    label: string
    placeholder?: string
    required: boolean
    helpText?: string
    width: "full" | "half"
    option?: string
}

interface Form {
    name: string
    companyId: string
    divisionId: string
    fields: FormFieldCreate[]
}

type Approver = {
    employee_code: string 
    name: string
    level: number
}

type Processor = {
    employee_code: string 
    name: string
    department?: string
}

type Finisher = {
    employee_code: string 
    name: string
}

export interface CreateTemplatePayload {
    name: string
    approver: Approver[]
    processor: Processor[]
    finisher: Finisher
}

export async function createTemplate(data: CreateTemplatePayload) {
    const response = await api.post('/template/create', data);
    return response.data
}