import { create } from "zustand";

type activity = {
    message: string;
    type: string;
    createdBy: {
        firstName: string;
    }
    createdAt: string;
}

interface activitiesDocument {
    document_code: string;
    activities: activity[];
}

export interface DocumentItem {
    documentNo: string;
    status: string;
    dueDate: string;
    priority: string;
    formSchema: {
        code: string;
        name: string;
        company: {
            name: string;
        };
        division: {
            name: string;
        };
    };
    workflowInstance: {
        workflowDefinitionVersion: {
            workflowStep: {
                type: string;
            }[];
        };
        executions: {
            steps: {
                type: string;
                status: string
            }[]
        }[]
    };
    createdBy: {
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    activities: activity[];
}

interface DocumentState {
    documents: DocumentItem[];
    approveDocuments: DocumentItem[];
    processDocuments: DocumentItem[];
    activitiyDocuments: activitiesDocument[];
    setDocuments: (documents: DocumentItem[]) => void;
    setApproveDocuments: (documents: DocumentItem[]) => void;
    setProcessDocuments: (documents: DocumentItem[]) => void;
    setActivitiesDocuments: (documents: DocumentItem[]) => void;
    clearDocuments: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
    documents: [],
    approveDocuments: [],
    processDocuments: [],
    activitiyDocuments: [],

    setDocuments: (documents) =>
        set({
            documents,
        }),

    setApproveDocuments: (documents) =>
        set({
            approveDocuments: documents.filter((doc) => {
                const type = doc.workflowInstance?.workflowDefinitionVersion?.workflowStep[0]?.type
                const isPending = doc.workflowInstance?.executions[0]?.steps.map(
                    (step) => step.status === "PENDING"
                );

                return doc.status === "WAITING_APPROVAL" && isPending && type === "APPROVER";
            }),
        }),

    setProcessDocuments: (documents) =>
        set({
            processDocuments: documents.filter((doc) => {
                const type = doc.workflowInstance?.workflowDefinitionVersion?.workflowStep[0]?.type;
                const status = doc.status
                return (type === "PROCESSOR" || type === "FINISHER") && status === "PROCESSING";
            }),
        }),

    setActivitiesDocuments: (document) =>
        set({
            activitiyDocuments: document.map((doc) => {
                const code = doc.documentNo
                const act = doc.activities.filter((ac) => ac.type === "PROCESS_NOTE")
                return {
                    document_code: code,
                    activities: act
                }
            })
        }),

    clearDocuments: () =>
        set({
            documents: [],
            approveDocuments: [],
            processDocuments: [],
            activitiyDocuments: []
        }),
}));