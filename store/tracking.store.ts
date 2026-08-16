import { create } from "zustand";

export type LastestDocumentItem = {
    createdAt: string;
    document: {
        documentNo: string;
        formSchema: {
            name: string;
        }
        createdBy: {
            firstName: string;
        }
    }
}

export type DocumentDetail = {
    documentNo: string;
    status: string;
    dueDate: string;
    createdBy: {
        firstName: string;
    };
    createdAt: string;
    revisions: Array<{
        snapshot: string;
        formData: string;
    }>;
    formSchema: {
        name: string;
        division?: {
            name: string;
        };
    };
    workflowInstance: {
        executions: Array<{
            steps: Array<{
                level: number;
                status: string;
                decision: string;
                startedAt: string;
                actedAt: string;
                employee: {
                    firstName: string;
                };
            }>;
        }>;
    };
    processInstances: Array<{
        processInstanceTasks: Array<{
            description: string;
            processBy: {
                firstName: string;
            };
            createAt: string;
        }>;
    }>;
    activities: Array<{
        id: string;
        documentId: string;
        type: string;
        message: string;
        metadata: string;
        createdById: string;
        createdAt: string;
        createdBy: {
            firstName: string;
        };
    }>;
}



interface TrackingState {
    LastestDocument: LastestDocumentItem[];
    SearchDocument: LastestDocumentItem[];
    SearchDocumentDetail: DocumentDetail;
    setLastestDocument: (document: LastestDocumentItem[]) => void;
    setSearchDocument: (document: LastestDocumentItem[]) => void;
    setDocumentDetail: (detail: DocumentDetail) => void;
    ClearTrackingDocument: () => void;
}

export const useTrackingStore = create<TrackingState>((set) => ({
    LastestDocument: [],
    SearchDocument: [],
    SearchDocumentDetail: {} as DocumentDetail,

    setLastestDocument: (document) => set({
        LastestDocument: document.slice(0, 10)
    }),
    
    setSearchDocument: (document) => set({
        SearchDocument: document
    }),

    setDocumentDetail: (document) => set({
        SearchDocumentDetail: document
    }),

    ClearTrackingDocument() {
        set({
            LastestDocument: []
        })
    },
}));