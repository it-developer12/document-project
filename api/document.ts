import { api } from "@/lib/axios";

export interface AddProcessPayload {
    document_code: string;
    task_description: string;
}

export interface ApproveDocumentPayload {
    document_code: string;
    decision: string;
    comment: string;
}

export interface CreateDocumentPayload {
    schema_id: string;
    snapshot: string;
    answers: string;
    due_date: string;
    iso_document?: string;
}

export async function getNavNumber() {
    const response = await api.get('/document/nav_data');
    return response.data;
}

export async function getDocumentList() {
    const response = await api.get('/document/user_document');
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

export async function addProcessDocument(data: AddProcessPayload) {
    const response = await api.post('/document/addprocess', data);
    return response.data
}

export async function completeDocument(data: string) {
    const response = await api.patch(`/document/finish/${data}`);
    return response.data
}

export async function getDocumentDetail(document_code: string) {
    const response = await api.get(`/document/document_data/${document_code}`);
    return response.data;
}

export async function getLastestDocument() {
    const response = await api.get('/document/lastest_updated');
    return response.data
}

export async function getTrackingDocument(document_code: string) {
    const response = await api.get(`/document/tracking/${document_code}`)
    return response.data
}