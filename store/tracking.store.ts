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

interface TrackingState {
    LastestDocument: LastestDocumentItem[];
    SearchDocument: LastestDocumentItem[];
    setLastestDocument: (document: LastestDocumentItem[]) => void;
    setSearchDocument: (document: LastestDocumentItem[]) => void;
    ClearTrackingDocument: () => void;
}

export const useTrackingStore = create<TrackingState>((set) => ({
    LastestDocument: [],
    SearchDocument: [],

    setLastestDocument: (document) => set({
        LastestDocument: document.slice(0, 10)
    }),
    
    setSearchDocument: (document) => set({
        SearchDocument: document.filter((doc) => )
    }),

    ClearTrackingDocument() {
        set({
            LastestDocument: []
        })
    },
}));