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
  setDocuments: (documents: DocumentItem[]) => void;
  addDocument: (document: DocumentItem) => void;
  clearDocuments: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],

  setDocuments: (documents) =>
    set({
      documents,
    }),

  addDocument: (document) =>
    set((state) => ({
      documents: [...state.documents, document],
    })),

  clearDocuments: () =>
    set({
      documents: [],
    }),
}));