import { api } from "@/lib/axios";

export interface ApproveDocumentPayload {
    document_code: string;
    decision: string;
    comment: string;
}

export interface CreateDocumentPayload {
    document_no: string;
    schema_id: string;
    snapshot: string;
    answers: string;
    due_date: string;
    iso_document?: string;
}

export async function getNavNumber() {
    const response = await api.get('/nav_data');
    return response.data;
}

export async function getDocumentList() {
    const response = await api.get('/user_document');
    return response.data;
}

export async function createDocument(data: CreateDocumentPayload) {
    const response = await api.post('/document/create', data);
    return response.data;
}

export async function approveDocument(data: ApproveDocumentPayload) {
    const response = await api.patch('/document/approve', data);
    return response.data;
}