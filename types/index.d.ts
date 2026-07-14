type FieldType =
    | "text" | "textarea" | "select" | "checkbox" | "radio"
    | "date" | "number" | "email" | "phone" | "url" | "toggle" | "file" | "table" |"employee_detail";

type ColumnType = "text" | "number" | "date" | "select";

interface TableColumn {
    id: string;
    label: string;
    type: ColumnType;
    options?: string[]; // for select columns
    width?: number;     // flex weight, default 1
}

interface FormField {
    id: string;
    type: FieldType;
    label: string;
    placeholder?: string;
    required: boolean;
    helpText?: string;
    options?: string[];
    width: "full" | "half";
    acceptedTypes?: string[];
    maxSizeMb?: number;
    multiple?: boolean;
    // table-specific
    columns?: TableColumn[];
    minRows?: number;
    maxRows?: number;
}