import { create } from "zustand";

export interface DocumentItem {
    documentNo: string;
    status: string;
    dueDate: string;
    formSchema: {
        name: string;
        company: {
            name: string;
        };
        division: {
            name: string;
        };
    };
    workflowInstance: {
        workflowDefinition: {
            versions: {
                workflowStep: {
                    type: string;
                }[];
            }[];
        };
    };
    createdBy: {
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    activities: {
        createdAt: string;
    }[];
}

interface DocumentState {
    documents: DocumentItem[];
    approveDocuments: DocumentItem[];
    processDocuments: DocumentItem[];
    setDocuments: (documents: DocumentItem[]) => void;
    setApproveDocuments: (documents: DocumentItem[]) => void;
    setProcessDocuments: (documents: DocumentItem[]) => void;
    clearDocuments: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
    documents: [],
    approveDocuments: [],
    processDocuments: [],

    setDocuments: (documents) =>
        set({
            documents,
        }),

    setApproveDocuments: (documents) =>
        set({
            approveDocuments: documents.filter(
                (doc) => doc.workflowInstance.workflowDefinition.versions[0].workflowStep[0].type === "APPROVER",
            ),
        }),

    setProcessDocuments: (documents) =>
        set({
            processDocuments: documents.filter(
                (doc) => doc.workflowInstance.workflowDefinition.versions[0].workflowStep[0].type === "PROCESSOR",
            ),
        }),

    clearDocuments: () =>
        set({
            documents: [],
            approveDocuments: [],
            processDocuments: [],
        }),
}));