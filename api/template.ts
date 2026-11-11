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

type Editor = {
    employee_code: string
    name: string
    department?: string
}

export interface CreateTemplatePayload {
    form: {
        name?: string
        code?: string
        division_code?: string
        divisionId?: string
        iso_no?: string
        fields?: FormFieldCreate[]
        requester_field: FormFieldCreate[]
        editor_field: FormFieldCreate[]
    }
    workflow: {
        name?: string
        code?: string
        division_code?: string
        approve_format?: string
        approver?: Approver[]
        processor_type: string
        editor_type: string
        processor: Processor[]
        editor: Editor[]
        finisher: Finisher
    }
}

export async function createTemplate(data: CreateTemplatePayload) {
    const response = await api.post('/template/create', data);
    return response.data
}

export async function updateTemplate(id:string, data: CreateTemplatePayload) {
    const response = await api.patch(`/template/${id}`, data);
    return response.data
}

export async function createDraftTemplate(data: CreateTemplatePayload) {
    const response = await api.post('/template/draft', data);
    return response.data
}

export async function updateDraftTemplate(data: CreateTemplatePayload) {
    const response = await api.patch(`/template/draft/`, data);
    return response.data
}

export async function deactivateTemplate(code: string) {
    const response = await api.delete(`/template/deactive/${code}`)
    return response.data
}