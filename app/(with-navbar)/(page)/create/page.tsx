'use client'
import { useState, useCallback } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Type, AlignLeft, ChevronDown, CheckSquare, Circle, Calendar,
    Hash, Mail, Phone, Link, GripVertical, Trash2, Settings,
    Eye, Plus, X, ToggleLeft, Paperclip, Table2,
    PlusCircle, UserSquare2,
    ArrowRight
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Select, { MultiValue } from 'react-select'
import { FieldPreview } from "./PreviewRender";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PaletteItem {
    type: FieldType;
    label: string;
    icon: React.ElementType;
    description: string;
}

const PALETTE: PaletteItem[] = [
    { type: "text", label: "Short Text", icon: Type, description: "Single-line text input" },
    { type: "textarea", label: "Long Text", icon: AlignLeft, description: "Multi-line text area" },
    { type: "number", label: "Number", icon: Hash, description: "Numeric input" },
    { type: "email", label: "Email", icon: Mail, description: "Email address" },
    { type: "phone", label: "Phone", icon: Phone, description: "Phone number" },
    { type: "url", label: "URL", icon: Link, description: "Web address" },
    { type: "date", label: "Date", icon: Calendar, description: "Date picker" },
    { type: "select", label: "Dropdown", icon: ChevronDown, description: "Single-select dropdown" },
    { type: "radio", label: "Radio Group", icon: Circle, description: "Single choice from list" },
    { type: "checkbox", label: "Checkbox", icon: CheckSquare, description: "Boolean or multi-choice" },
    { type: "toggle", label: "Toggle", icon: ToggleLeft, description: "On/off switch" },
    { type: "file", label: "File Upload", icon: Paperclip, description: "Drag & drop file input" },
    { type: "table", label: "Table", icon: Table2, description: "Multi-row data table input" },
    { type: "employee_detail", label: "Employee Detail", icon: UserSquare2, description: "Employee info block (TH)" },
];

// Prefix palette drag IDs so we can distinguish them from field sort IDs
const PALETTE_PREFIX = "palette::";

let idCounter = 100;
const uid = (type: FieldType) => `${type}-field-${++idCounter}`;

function makeField(type: FieldType): FormField {
    const defaults: Partial<Record<FieldType, Partial<FormField>>> = {
        select: { options: ["Option 1", "Option 2", "Option 3"] },
        radio: { options: ["Option A", "Option B", "Option C"] },
        checkbox: { options: ["Choice 1", "Choice 2"] },
        file: { acceptedTypes: ["PDF", "DOCX", "PNG"], maxSizeMb: 10, multiple: false },
        employee_detail: { width: "full" },
        table: {
            width: "full",
            minRows: 1,
            maxRows: 20,
            columns: [
                { id: "col-1", label: "Item", type: "text", width: 1 },
                { id: "col-2", label: "Quantity", type: "number", width: 1 },
                { id: "col-3", label: "Unit Price", type: "number", width: 1 },
                { id: "col-4", label: "Notes", type: "text", width: 1 },
            ],
        },
    };
    return {
        id: uid(type),
        type,
        label: PALETTE.find((p) => p.type === type)?.label ?? "Field",
        placeholder: ["text", "textarea", "number", "email", "phone", "url"].includes(type)
            ? "Enter value…"
            : undefined,
        required: false,
        helpText: "",
        width: "full",
        ...(defaults[type] ?? {}),
    };
}


// ─── Palette Card (draggable from sidebar) ────────────────────────────────────

function PaletteCard({
    item,
    overlay = false,
}: {
    item: PaletteItem;
    overlay?: boolean;
}) {
    const { attributes, listeners, setNodeRef, isDragging } = useSortable({
        id: `${PALETTE_PREFIX}${item.type}`,
        data: { isPalette: true, paletteType: item.type },
    });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-grab active:cursor-grabbing select-none transition-all"
            style={{
                borderColor: "var(--border)",
                background: overlay ? "var(--accent)" : "var(--card)",
                opacity: isDragging ? 0.35 : 1,
                boxShadow: overlay ? "0 8px 24px rgba(0,0,0,0.12)" : undefined,
                touchAction: "none",
            }}
        >
            <div
                className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
                style={{ background: "var(--accent)" }}
            >
                <item.icon size={13} color="var(--primary)" />
            </div>
            <div className="min-w-0 flex-1">
                <p style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--foreground)" }}>{item.label}</p>
                <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>{item.description}</p>
            </div>
            <GripVertical size={12} color="var(--muted-foreground)" className="shrink-0 opacity-40" />
        </div>
    );
}

// ─── Sortable Field Row in canvas ─────────────────────────────────────────────

function SortableFieldRow({
    field,
    isSelected,
    onSelect,
    onDelete,
}: {
    field: FormField;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: field.id, data: { isField: true } });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        touchAction: "none",
    };

    return (
        <div ref={setNodeRef} style={style}>
            <FieldRowCard
                field={field}
                isSelected={isSelected}
                onSelect={onSelect}
                onDelete={onDelete}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
}

// ─── Field card (shared between sortable row and overlay) ─────────────────────

function FieldRowCard({
    field,
    isSelected,
    onSelect,
    onDelete,
    dragHandleProps,
}: {
    field: FormField;
    isSelected: boolean;
    onSelect?: () => void;
    onDelete?: () => void;
    dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}) {
    const Icon = PALETTE.find((p) => p.type === field.type)?.icon ?? Type;

    return (
        <div
            className="flex gap-3 p-4 rounded-xl border cursor-pointer transition-all group"
            style={{
                borderColor: isSelected ? "var(--primary)" : "var(--border)",
                background: isSelected ? "var(--accent)" : "var(--card)",
                boxShadow: isSelected
                    ? "0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent)"
                    : undefined,
            }}
            onClick={onSelect}
        >
            {/* Grip handle */}
            <div
                {...dragHandleProps}
                className="flex items-start pt-0.5 opacity-30 group-hover:opacity-60 transition-opacity cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
            >
                <GripVertical size={14} color="var(--foreground)" />
            </div>

            {/* Field content */}
            <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <div
                        className="flex items-center justify-center w-5 h-5 rounded shrink-0"
                        style={{ background: "var(--secondary)" }}
                    >
                        <Icon size={11} color="var(--primary)" />
                    </div>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground)" }}>
                        {field.label}
                    </span>
                    {field.required && (
                        <span style={{ fontSize: "0.65rem", color: "var(--destructive)", fontWeight: 600 }}>
                            {"REQUIRED"}
                        </span>
                    )}
                    <span
                        className="ml-auto px-1.5 py-0.5 rounded"
                        style={{ fontSize: "0.65rem", background: "var(--secondary)", color: "var(--muted-foreground)" }}
                    >
                        {field.width === "half" ? "½ width" : "Full width"}
                    </span>
                </div>

                <FieldPreview field={field} />

                {field.helpText && (
                    <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{field.helpText}</p>
                )}
            </div>

            {/* Actions */}
            {(onDelete) && (
                <div
                    className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="p-1.5 rounded-md transition-colors hover:bg-destructive/10"
                        style={{ color: "var(--muted-foreground)" }}
                        onClick={onDelete}
                        title="Delete"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Canvas drop indicator ────────────────────────────────────────────────────

function CanvasDropHint({ isOver }: { isOver: boolean }) {
    return (
        <div
            className="flex flex-col items-center justify-center gap-3 py-16 rounded-xl border-2 border-dashed transition-all duration-150"
            style={{
                borderColor: isOver ? "var(--primary)" : "var(--border)",
                background: isOver ? "var(--accent)" : "transparent",
            }}
        >
            <div
                className="flex items-center justify-center w-10 h-10 rounded-full"
                style={{ background: "var(--secondary)" }}
            >
                <Plus size={18} color="var(--muted-foreground)" />
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                {"Drag fields here to build your form"}
            </p>
        </div>
    );
}

// ─── Table column editor (used inside PropertiesPanel) ────────────────────────

let colCounter = 10;
const colUid = () => `col-${++colCounter}`;

const COL_TYPES: ColumnType[] = ["text", "number", "date", "select"];

function TablePropertiesEditor({
    field,
    onChange,
}: {
    field: FormField;
    onChange: (updates: Partial<FormField>) => void;
}) {
    const cols = field.columns ?? [];
    const inputStyle: React.CSSProperties = {
        borderColor: "var(--border)",
        background: "var(--input-background)",
        color: "var(--foreground)",
        fontSize: "0.75rem",
    };

    const updateCol = (idx: number, updates: Partial<TableColumn>) => {
        const next = cols.map((c, i) => (i === idx ? { ...c, ...updates } : c));
        onChange({ columns: next });
    };

    const removeCol = (idx: number) => {
        onChange({ columns: cols.filter((_, i) => i !== idx) });
    };

    const addCol = () => {
        onChange({
            columns: [
                ...cols,
                { id: colUid(), label: `Column ${cols.length + 1}`, type: "text", width: 1 },
            ],
        });
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Min/max rows */}
            <div className="grid grid-cols-2 gap-2">
                {(["minRows", "maxRows"] as const).map((key) => (
                    <div key={key} className="flex flex-col gap-1">
                        <label style={{ fontSize: "0.7rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
                            {key === "minRows" ? "Min Rows" : "Max Rows"}
                        </label>
                        <input
                            type="number"
                            min={1}
                            className="px-2.5 py-1.5 rounded-lg border outline-none"
                            style={inputStyle}
                            value={field[key] ?? (key === "minRows" ? 1 : 20)}
                            onChange={(e) => onChange({ [key]: Number(e.target.value) })}
                            onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                        />
                    </div>
                ))}
            </div>

            {/* Column list */}
            <div className="flex flex-col gap-1.5">
                <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--muted-foreground)" }}>
                    Columns ({cols.length})
                </label>

                <div className="flex flex-col gap-2">
                    {cols.map((col, idx) => (
                        <div
                            key={col.id}
                            className="flex flex-col gap-2 p-3 rounded-lg border"
                            style={{ borderColor: "var(--border)", background: "var(--input-background)" }}
                        >
                            {/* Label + delete */}
                            <div className="flex items-center gap-2">
                                <input
                                    className="flex-1 px-2 py-1 rounded border outline-none"
                                    style={{ ...inputStyle, fontSize: "0.75rem" }}
                                    value={col.label}
                                    placeholder="Column name"
                                    onChange={(e) => updateCol(idx, { label: e.target.value })}
                                    onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                                />
                                <button
                                    className="p-1 rounded hover:bg-destructive/10 transition-colors shrink-0"
                                    style={{ color: "var(--muted-foreground)" }}
                                    onClick={() => removeCol(idx)}
                                >
                                    <X size={12} />
                                </button>
                            </div>

                            {/* Type + width */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1">
                                    <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", fontWeight: 500 }}>Type</span>
                                    <select
                                        className="px-2 py-1 rounded border outline-none appearance-none"
                                        style={inputStyle}
                                        value={col.type}
                                        onChange={(e) => updateCol(idx, { type: e.target.value as ColumnType })}
                                    >
                                        {COL_TYPES.map((t) => (
                                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", fontWeight: 500 }}>Width</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={6}
                                        className="px-2 py-1 rounded border outline-none"
                                        style={inputStyle}
                                        value={col.width ?? 1}
                                        onChange={(e) => updateCol(idx, { width: Number(e.target.value) })}
                                        onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                                        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                                    />
                                </div>
                            </div>

                            {/* Select options */}
                            {col.type === "select" && (
                                <div className="flex flex-col gap-1.5">
                                    <span style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", fontWeight: 500 }}>Options</span>
                                    {(col.options ?? []).map((opt, oi) => (
                                        <div key={oi} className="flex items-center gap-1">
                                            <input
                                                className="flex-1 px-2 py-0.5 rounded border outline-none"
                                                style={{ ...inputStyle, fontSize: "0.72rem" }}
                                                value={opt}
                                                onChange={(e) => {
                                                    const opts = [...(col.options ?? [])];
                                                    opts[oi] = e.target.value;
                                                    updateCol(idx, { options: opts });
                                                }}
                                                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                                                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                                            />
                                            <button
                                                className="p-0.5 rounded hover:bg-destructive/10"
                                                style={{ color: "var(--muted-foreground)" }}
                                                onClick={() =>
                                                    updateCol(idx, { options: col.options?.filter((_, j) => j !== oi) })
                                                }
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        className="flex items-center gap-1 text-left"
                                        style={{ fontSize: "0.68rem", color: "var(--primary)" }}
                                        onClick={() =>
                                            updateCol(idx, { options: [...(col.options ?? []), `Option ${(col.options?.length ?? 0) + 1}`] })
                                        }
                                    >
                                        <Plus size={10} /> Add option
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={addCol}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed transition-colors hover:bg-secondary"
                        style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", fontSize: "0.78rem" }}
                    >
                        <PlusCircle size={13} /> Add column
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Properties panel ────────────────────────────────────────────────────────

function PropertiesPanel({
    field,
    onChange,
    onClose,
}: {
    field: FormField;
    onChange: (updates: Partial<FormField>) => void;
    onClose: () => void;
}) {
    const inputCls = "w-full px-3 py-2 rounded-lg border outline-none transition-all";
    const inputStyle: React.CSSProperties = {
        borderColor: "var(--border)",
        background: "var(--input-background)",
        color: "var(--foreground)",
        fontSize: "0.8rem",
    };
    const hasOptions = ["select", "radio", "checkbox"].includes(field.type);

    return (
        <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <div
                className="flex items-center justify-between px-5 py-4 border-b sticky top-0 z-10"
                style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
                <div className="flex items-center gap-2">
                    <Settings size={14} color="var(--primary)" />
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>
                        Field Settings
                    </span>
                </div>
                <button onClick={onClose} style={{ color: "var(--muted-foreground)" }}>
                    <X size={15} />
                </button>
            </div>

            <div className="flex flex-col gap-5 p-5">
                {/* Label */}
                <div className="flex flex-col gap-1.5">
                    <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Label</label>
                    <input
                        className={inputCls}
                        style={inputStyle}
                        value={field.label}
                        onChange={(e) => onChange({ label: e.target.value })}
                        onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    />
                </div>

                {/* Placeholder */}
                {field.placeholder !== undefined && (
                    <div className="flex flex-col gap-1.5">
                        <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Placeholder</label>
                        <input
                            className={inputCls}
                            style={inputStyle}
                            value={field.placeholder}
                            onChange={(e) => onChange({ placeholder: e.target.value })}
                            onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                        />
                    </div>
                )}

                {/* Help text */}
                <div className="flex flex-col gap-1.5">
                    <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Help Text</label>
                    <input
                        className={inputCls}
                        style={inputStyle}
                        value={field.helpText}
                        placeholder="Optional hint for the user…"
                        onChange={(e) => onChange({ helpText: e.target.value })}
                        onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    />
                </div>

                {/* Width */}
                <div className="flex flex-col gap-1.5">
                    <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Width</label>
                    <div className="grid grid-cols-2 gap-2">
                        {(["full", "half"] as const).map((w) => (
                            <button
                                key={w}
                                className="py-2 rounded-lg border transition-all"
                                style={{
                                    fontSize: "0.78rem",
                                    fontWeight: field.width === w ? 600 : 400,
                                    borderColor: field.width === w ? "var(--primary)" : "var(--border)",
                                    background: field.width === w ? "var(--accent)" : "var(--input-background)",
                                    color: field.width === w ? "var(--primary)" : "var(--muted-foreground)",
                                }}
                                onClick={() => onChange({ width: w })}
                            >
                                {w === "full" ? "Full width" : "Half width"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Required */}
                <div className="flex items-center justify-between">
                    <div>
                        <p style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--foreground)" }}>Required</p>
                        <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>Users must fill this field</p>
                    </div>
                    <button
                        className="relative w-10 h-6 rounded-full border transition-colors"
                        style={{ background: field.required ? "var(--primary)" : "var(--switch-background)" }}
                        onClick={() => onChange({ required: !field.required })}
                    >
                        <div
                            className="absolute top-1 w-4 h-4 border rounded-full transition-all"
                            style={{ left: field.required ? "calc(100% - 1.25rem)" : "0.25rem", backgroundColor: field.required ? "white" : "black" }}
                        />
                    </button>
                </div>

                {/* File-specific settings */}
                {field.type === "file" && (
                    <>
                        <div className="flex flex-col gap-2">
                            <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Accepted File Types</label>
                            <div className="flex flex-wrap gap-1.5">
                                {["PDF", "DOCX", "XLSX", "PNG", "JPG", "ZIP", "CSV", "TXT"].map((t) => {
                                    const active = field.acceptedTypes?.includes(t);
                                    return (
                                        <button
                                            key={t}
                                            className="px-2.5 py-1 rounded-md border transition-all"
                                            style={{
                                                fontSize: "0.7rem",
                                                fontWeight: 600,
                                                borderColor: active ? "var(--primary)" : "var(--border)",
                                                background: active ? "var(--accent)" : "var(--input-background)",
                                                color: active ? "var(--primary)" : "var(--muted-foreground)",
                                            }}
                                            onClick={() => {
                                                const current = field.acceptedTypes ?? [];
                                                onChange({
                                                    acceptedTypes: active
                                                        ? current.filter((x) => x !== t)
                                                        : [...current, t],
                                                });
                                            }}
                                        >
                                            {t}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Max File Size (MB)</label>
                            <input
                                type="number"
                                min={1}
                                max={500}
                                className={inputCls}
                                style={inputStyle}
                                value={field.maxSizeMb ?? 10}
                                onChange={(e) => onChange({ maxSizeMb: Number(e.target.value) })}
                                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--foreground)" }}>Allow Multiple Files</p>
                                <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>User can upload more than one</p>
                            </div>
                            <button
                                className="relative w-10 h-6 rounded-full border transition-colors"
                                style={{ background: field.multiple ? "var(--primary)" : "var(--switch-background)" }}
                                onClick={() => onChange({ multiple: !field.multiple })}
                            >
                                <div
                                    className="absolute top-1 w-4 h-4 rounded-full transition-all"
                                    style={{ left: field.multiple ? "calc(100% - 1.25rem)" : "0.25rem", backgroundColor: field.multiple ? "white" : "black" }}
                                />
                            </button>
                        </div>
                    </>
                )}

                {/* Table settings */}
                {field.type === "table" && (
                    <TablePropertiesEditor field={field} onChange={onChange} />
                )}

                {/* Options editor */}
                {hasOptions && (
                    <div className="flex flex-col gap-2">
                        <label style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--muted-foreground)" }}>Options</label>
                        <div className="flex flex-col gap-2">
                            {field.options?.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input
                                        className="flex-1 px-3 py-1.5 rounded-lg border outline-none"
                                        style={{ ...inputStyle, fontSize: "0.78rem" }}
                                        value={opt}
                                        onChange={(e) => {
                                            const opts = [...(field.options ?? [])];
                                            opts[i] = e.target.value;
                                            onChange({ options: opts });
                                        }}
                                        onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                                        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                                    />
                                    <button
                                        className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                                        style={{ color: "var(--muted-foreground)" }}
                                        onClick={() => onChange({ options: field.options?.filter((_, j) => j !== i) })}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            <button
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed transition-colors hover:bg-secondary"
                                style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", fontSize: "0.78rem" }}
                                onClick={() =>
                                    onChange({ options: [...(field.options ?? []), `Option ${(field.options?.length ?? 0) + 1}`] })
                                }
                            >
                                <Plus size={12} /> Add option
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Preview modal ────────────────────────────────────────────────────────────

function PreviewModal({ fields, onClose }: { fields: FormField[]; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
        >
            <div
                className="flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                    <span style={{ fontWeight: 600, color: "var(--foreground)" }}>Form Preview</span>
                    <button onClick={onClose} style={{ color: "var(--muted-foreground)" }}><X size={16} /></button>
                </div>
                <div className="overflow-y-auto p-6 flex flex-col gap-5" style={{ scrollbarWidth: "none" }}>
                    {fields.length === 0 && (
                        <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", textAlign: "center" }}>
                            {"ยังไม่ได้เลือก field"}
                        </p>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        {fields.map((f) => (
                            <div
                                key={f.id}
                                className="flex flex-col gap-1.5"
                                style={{ gridColumn: f.width === "full" ? "1 / -1" : undefined }}
                            >
                                <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}>
                                    {f.label}
                                    {f.required && <span style={{ color: "var(--destructive)", marginLeft: "0.25rem" }}>*</span>}
                                </label>
                                <FieldPreview field={f} />
                                {f.helpText && (
                                    <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{f.helpText}</p>
                                )}
                            </div>
                        ))}
                    </div>
                    {fields.length > 0 && (
                        <div className="flex justify-end pt-2">
                            <button
                                className="px-5 py-2.5 rounded-lg"
                                style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: "0.875rem", fontWeight: 500 }}
                            >
                                Submit
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main FormBuilder ─────────────────────────────────────────────────────────

export default function Page() {

    // Sample data
    // { ...makeField("text"), id: "f1", label: "Full Name", required: true, placeholder: "e.g. Sarah Chen" },
    // { ...makeField("email"), id: "f2", label: "Email Address", required: true, placeholder: "you@company.com" },
    const COMPANY_OPTIONS = [
        { label: "บริษัท ซิตี้เฟรชฟรุ๊ต จำกัด (CFF)", value: "cff" },
        { label: "บริษัท ซีทีเอ็กซ์ โฮลดิ้ง จำกัด (CTX)", value: "ctx" },
        { label: "บริษัท โนเบิ้ลมาร์เก็ตติ้ง จำกัด (NBM)", value: "nbm" },
    ];

    const DEPARTMENT_OPTIONS = [
        { label: "เทคโนโลยีสารสนเทศ", value: "it" },
        { label: "บัญชีและการเงิน", value: "fn" },
        { label: "บริหาร", value: "mg" }
    ]

    interface EmployeeList {
        employee_id: string;
        label: string;
    }

    interface ApproverListType extends EmployeeList {
        level: number;
    }

    interface Options {
        value: string;
        label: string;
    }

    interface EmployeeStatus {
        approve: "current" | "in_doc";
        process: "current" | "in_doc" | "zero";
        finish: "current" | "in_doc";
    }

    const [employeeListStatus, setEmployeeListStatus] = useState<EmployeeStatus>({
        approve: "current",
        process: "current",
        finish: "current"
    });
    const [modalStatus, setModalStatus] = useState({
        approve: false,
        process: false,
        finish: false
    });
    const [approver, setApprover] = useState<ApproverListType[]>([
        { level: 1, employee_id: "", label: "" }
    ]);
    const [processor, setProcessor] = useState<EmployeeList[]>([
        { employee_id: "", label: "" }
    ]);
    const [finisher, setFinisher] = useState<EmployeeList>({
        employee_id: "",
        label: ""
    })
    const ApproverList: Options[] = [
        { value: "0000001", label: "Approver 1" },
        { value: "0000002", label: "Approver 2" },
        { value: "0000003", label: "Approver 3" },
        { value: "0000004", label: "Approver 4" },
    ];

    const ProcessorList: Options[] = [
        { value: "1000001", label: "Processor 1" },
        { value: "1000002", label: "Processor 2" },
        { value: "1000003", label: "Processor 3" },
        { value: "1000004", label: "Processor 4" },
    ]

    const FinisherList: Options[] = [
        { value: "1100001", label: "Finisher 1" },
        { value: "1100002", label: "Finisher 2" },
        { value: "1100003", label: "Finisher 3" },
        { value: "1100004", label: "Finisher 4" },
    ]

    const [fields, setFields] = useState<FormField[]>([
        {
            "id": "employee_detail-field-10001",
            "type": "employee_detail",
            "label": "ข้อมูลพนักงาน",
            "required": true,
            "helpText": "",
            "width": "full"
        }
    ]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [preview, setPreview] = useState(false);

    // Track what's being dragged: a palette type or a field id
    const [activeId, setActiveId] = useState<string | null>(null);
    // Whether the active drag is hovering over the canvas
    const [isOverCanvas, setIsOverCanvas] = useState(false);


    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
    );

    const selectedField = fields.find((f) => f.id === selectedId) ?? null;

    const addField = useCallback((type: FieldType, atIndex?: number) => {
        const f = makeField(type);
        setFields((prev) => {
            const next = [...prev];
            if (atIndex !== undefined) {
                next.splice(atIndex, 0, f);
            } else {
                next.push(f);
            }
            return next;
        });
        setSelectedId(f.id);
        return f.id;
    }, []);

    const deleteField = useCallback((id: string) => {
        setFields((prev) => prev.filter((f) => f.id !== id));
        setSelectedId((sel) => (sel === id ? null : sel));
    }, []);

    const updateField = useCallback((id: string, updates: Partial<FormField>) => {
        setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    }, []);

    // ── Drag event handlers ──

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(String(event.active.id));
    };

    const handleDragOver = (event: DragOverEvent) => {
        const overId = event.over?.id ? String(event.over.id) : null;
        // "canvas-drop-zone" is the droppable id of the empty canvas
        const overCanvas =
            overId === "canvas-drop-zone" ||
            fields.some((f) => f.id === overId);
        setIsOverCanvas(overCanvas);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setIsOverCanvas(false);

        if (!over) return;

        const activeIdStr = String(active.id);
        const overIdStr = String(over.id);

        const isPaletteDrag = activeIdStr.startsWith(PALETTE_PREFIX);

        if (isPaletteDrag) {
            // Palette → canvas: insert field
            const paletteType = activeIdStr.replace(PALETTE_PREFIX, "") as FieldType;
            const overFieldIndex = fields.findIndex((f) => f.id === overIdStr);
            addField(paletteType, overFieldIndex >= 0 ? overFieldIndex + 1 : undefined);
        } else {
            // Field reorder within canvas
            const oldIndex = fields.findIndex((f) => f.id === activeIdStr);
            const newIndex = fields.findIndex((f) => f.id === overIdStr);
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                setFields((prev) => arrayMove(prev, oldIndex, newIndex));
            }
        }
    };
    const router = useRouter();
    // Overlay content shown while dragging
    const activePaletteItem = activeId?.startsWith(PALETTE_PREFIX)
        ? PALETTE.find((p) => p.type === activeId.replace(PALETTE_PREFIX, ""))
        : null;
    const activeField = activeId && !activeId.startsWith(PALETTE_PREFIX)
        ? fields.find((f) => f.id === activeId)
        : null;

    const handleRemoveApprover = (index: number) => {
        setApprover(
            approver.filter((_, i) => i !== index)
        );
    };

    const handleRemoveProcessor = (index: number) => {
        setProcessor(
            processor.filter((_, i) => i !== index)
        );
    };

    const handleAddApprover = () => {
        setApprover((prev) => [
            ...prev,
            {
                level: prev[prev.length - 1].level + 1,
                employee_id: "",
                label: ""
            },
        ]);
    };

    const handleAddProcessor = () => {
        setProcessor((prev) => [
            ...prev,
            {
                employee_id: "",
                label: ""
            },
        ]);
    };

    const getAvailableOptions = (currentIndex: number, Lists: any, EmployeeList: Options[]) => {
        const selectedValues = Lists
            .filter((_: any, i: number) => i == currentIndex)
            .flatMap((item: any) => item.employee_id);

        return EmployeeList.filter(
            (option) => !selectedValues.includes(option.value)
        );
    };

    function EmployeeModal({ onClose, type, List }: { onClose: () => void, type: string, List: any }) {

        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-6"
                style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
                onClick={onClose}
            >
                <div
                    className="flex flex-col w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
                    style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                        <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{"เพิ่ม" + type}</span>
                        <button onClick={onClose} className="hover:cursor-pointer" style={{ color: "var(--muted-foreground)" }}><X size={16} /></button>
                    </div>
                    <div className="overflow-y-auto p-6 flex flex-col gap-5 min-h-[80vh]" style={{ scrollbarWidth: "none" }}>
                        {type == "ผู้อนุมัติ" && List.map((app: any, index: number) => (
                            <div
                                key={index}
                                className={`flex flex-col gap-2 min-w-0 md:flex-row md:items-center md:gap-2 w-full`}
                            >
                                <div className="flex gap-2 items-center">
                                    <span>
                                        {type} {"คนที่"} {index + 1}
                                    </span>
                                </div>
                                <Select
                                    key={index}
                                    defaultInputValue=""
                                    placeholder="โปรดเลือกผู้อนุญาติเอกสาร"
                                    className="md:w-1/2 rounded-lg basic-multi-select"
                                    options={getAvailableOptions(index, approver, ApproverList)}
                                    value={ApproverList.filter(
                                        (option) => approver
                                            .filter((_, i) => i == index)
                                            .flatMap((item) => item.employee_id).includes(option.value))
                                    }
                                    onChange={(selected) => {
                                        setApprover(prev =>
                                            prev.map((item, i) =>
                                                i === index
                                                    ? {
                                                        ...item,
                                                        employee_id: selected?.value ?? "",
                                                        label: selected?.label ?? ""
                                                    }
                                                    : item
                                            )
                                        );
                                    }}
                                />
                                {
                                    index === approver.length - 1 && (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleAddApprover}
                                                className="bg-green-400 text-white px-2 py-0.5 rounded-md hover:cursor-pointer"
                                            >
                                                เพิ่ม
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveApprover(index)}
                                                className={`bg-red-400 text-white px-2 py-0.5 rounded-md ${index === 0 ? 'hidden' : ''}`}
                                            >
                                                ลบ
                                            </button>
                                        </div>
                                    )
                                }
                            </div>
                        ))}
                        {type == "ผู้ดำเนินการ" && List.map((app: any, index: number) => (
                            <div
                                key={index}
                                className={`flex flex-col gap-2 min-w-0 md:flex-row md:items-center md:gap-2 w-full`}
                            >
                                <div className="flex gap-2 items-center">
                                    <span>
                                        {type} {"คนที่"} {index + 1}
                                    </span>
                                </div>
                                <Select
                                    key={index}
                                    defaultInputValue=""
                                    placeholder="โปรดเลือกผู้อนุญาติเอกสาร"
                                    className="md:w-1/2 rounded-lg basic-multi-select"
                                    options={getAvailableOptions(index, processor, ProcessorList)}
                                    value={ProcessorList.filter(
                                        (option) => processor
                                            .filter((_, i) => i == index)
                                            .flatMap((item) => item.employee_id).includes(option.value))
                                    }
                                    onChange={(selected) => {
                                        setProcessor(prev =>
                                            prev.map((item, i) =>
                                                i === index
                                                    ? {
                                                        ...item,
                                                        employee_id: selected?.value ?? "",
                                                        label: selected?.label ?? ""
                                                    }
                                                    : item
                                            )
                                        );
                                    }}
                                />
                                {
                                    index === processor.length - 1 && (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleAddProcessor}
                                                className="bg-green-400 text-white px-2 py-0.5 rounded-md hover:cursor-pointer"
                                            >
                                                เพิ่ม
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveProcessor(index)}
                                                className={`bg-red-400 text-white px-2 py-0.5 rounded-md ${index === 0 ? 'hidden' : ''}`}
                                            >
                                                ลบ
                                            </button>
                                        </div>
                                    )
                                }
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    function saveForm() {
        console.log(fields)
        console.log(approver)
        router.push('/dashboard')
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col min-h-screen w-full" style={{ background: "var(--background)" }}>

                {/* Top bar */}
                <div
                    className="flex flex-col gap-4 px-4 py-4 border-b w-full md:flex-row md:items-center md:justify-between"
                    style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                    <div className="flex flex-col gap-0.5 w-full md:w-1/5">
                        <span
                            className="font-bold text-xl"
                        >{"สร้างรูปแบบเอกสารใหม่"}</span>
                        <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                            {fields.length} {"field"}{fields.length !== 1 ? "s" : ""} {"· เลือกช่องที่ต้องการแก้ไข"}
                        </p>
                    </div>
                    <div className="space-y-4 w-full md:w-3/5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <div className="flex flex-col gap-2 min-w-0 md:flex-row md:items-center md:gap-2 w-full">
                                <span className="text-nowrap">{"ชื่อเอกสาร"}</span>
                                <input type="text" className="pl-2 border py-1 rounded bg-[#F3F4F8] text-sm w-full md:w-40" />
                            </div>
                            <div className="flex flex-col gap-2 min-w-0 md:flex-row md:items-center md:gap-2 w-full">
                                <span className="text-nowrap">{"เอกสารของแผนก"}</span>
                                <Select options={DEPARTMENT_OPTIONS} className="w-full md:w-52 rounded-lg" />
                            </div>
                            <div className="flex flex-col gap-2 min-w-0 md:flex-row md:items-center md:gap-2 w-full">
                                <span className="text-nowrap">{"เอกสารของบริษัท"}</span>
                                <Select options={COMPANY_OPTIONS} className="w-full md:w-52 rounded-lg" />
                            </div>
                        </div>
                        <div className="text-nowrap">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                <span className="text-nowrap">{"ผู้อนุมัติเอกสาร"}</span>
                                <RadioGroup defaultValue="current" value={employeeListStatus.approve} onValueChange={value => setEmployeeListStatus(prev => ({ ...prev, approve: value }))} className="w-fit flex flex-col gap-2 md:flex-row md:items-center">
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem value="current" id="r1" />
                                        <Label htmlFor="r1">{"แก้ไขในหน้าปัจจุบัน"}</Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem value="in_doc" id="r2" />
                                        <Label htmlFor="r2">{"แก้ไขแยกเฉพาะเอกสาร"}</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className={`flex flex-col gap-3 pl-0 mt-2 w-full md:flex-row md:pl-4 ${employeeListStatus.approve === "current" ? "" : "hidden"}`}>
                                <button
                                    type="button"
                                    className="bg-[#4A4DF1] text-white w-36 px-2 py-0.5 min-w-36 rounded hover:cursor-pointer"
                                    onClick={() => setModalStatus(prev => ({ ...prev, approve: true }))}
                                >
                                    {"เพิ่มผู้อนุมัติ"}
                                </button>
                                <div className="flex items-center w-full overflow-x-auto scrollbar-none">
                                    {approver[0].employee_id != "" && approver.map((app, index) => (
                                        <div key={index} className="flex items-center">
                                            <span>{app.label}</span>
                                            {index != approver.length - 1 && <ArrowRight size={14} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                <span className="text-nowrap">{"ผู้ดำเนินการตามคำร้องขอเอกสาร"}</span>
                                <RadioGroup defaultValue="current" value={employeeListStatus.process} onValueChange={value => setEmployeeListStatus(prev => ({ ...prev, process: value }))} className="w-fit flex flex-col gap-2 md:flex-row md:items-center">
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem value="current" id="r3" />
                                        <Label htmlFor="r3">{"แก้ไขในหน้าปัจจุบัน"}</Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem value="in_doc" id="r4" />
                                        <Label htmlFor="r4">{"แก้ไขแยกเฉพาะเอกสาร"}</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className={`flex flex-col gap-3 pl-0 mt-2 w-full md:flex-row md:pl-4 ${employeeListStatus.process === "current" ? "" : "hidden"}`}>
                                <button
                                    type="button"
                                    className="bg-[#4A4DF1] text-white w-36 px-2 py-0.5 min-w-36 rounded hover:cursor-pointer"
                                    onClick={() => setModalStatus(prev => ({ ...prev, process: true }))}
                                >
                                    {"เพิ่มผู้ดำเนินการ"}
                                </button>
                                <div className="flex items-center w-full overflow-x-auto scrollbar-none">
                                    {processor[0].employee_id != "" && processor.map((app, index) => (
                                        <div className="flex">
                                            <span>{app.label}</span>
                                            {index != processor.length - 1 && ", "}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                <span className="text-nowrap">{"ผู้สิ้นสุดเอกสาร"}</span>
                                <RadioGroup defaultValue="current" value={employeeListStatus.finish} onValueChange={value => setEmployeeListStatus(prev => ({ ...prev, finish: value }))} className="w-fit flex flex-col gap-2 md:flex-row md:items-center">
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem value="current" id="r5" />
                                        <Label htmlFor="r5">{"แก้ไขในหน้าปัจจุบัน"}</Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <RadioGroupItem value="in_doc" id="r6" />
                                        <Label htmlFor="r6">{"แก้ไขแยกเฉพาะเอกสาร"}</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className={`pl-0 mt-2 ${employeeListStatus.finish === "current" ? "" : "hidden"}`}>
                                <div
                                    className={`flex flex-col gap-2 mt-2 sm:flex-row sm:items-center`}
                                >
                                    <div className="flex gap-2 items-center">
                                        <span>
                                            {"ผู้สำเร็จเอกสาร"}
                                        </span>
                                    </div>
                                    <Select
                                        defaultInputValue=""
                                        placeholder="โปรดเลือกผู้สำเร็จเอกสาร"
                                        className="w-full sm:w-2/5 rounded-lg basic-multi-select"
                                        defaultValue={{ label: "โปรดเลือกผู้สำเร็จเอกสาร", value: "1" }}
                                        options={FinisherList.filter(em => em.value !== finisher.employee_id)}
                                        value={FinisherList.find(option => option.value === finisher.employee_id) ?? null}
                                        onChange={(selected) => {
                                            if (!selected) return;
                                            setFinisher({ employee_id: selected.value, label: selected.label });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 items-stretch justify-end w-full md:w-1/5 md:flex-row md:items-center md:justify-end">
                        <button
                            onClick={() => setPreview(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors hover:bg-secondary hover:cursor-pointer w-full md:w-auto"
                            style={{ borderColor: "var(--border)", color: "var(--foreground)", fontSize: "0.8rem" }}
                        >
                            <Eye size={14} /> {"Preview"}
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:opacity-90 hover:cursor-pointer"
                            style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: "0.8rem", fontWeight: 500 }}
                            onClick={() => saveForm()}
                        >
                            {"Save Form"}
                        </button>
                    </div>
                </div>

                {/* 3-panel layout */}
                <div className="flex flex-col flex-1 overflow-hidden md:flex-row">

                    {/* Left — Palette */}
                    <aside
                        className="flex flex-col w-full md:w-1/5 shrink-0 border-b md:border-b-0 md:border-r overflow-y-auto"
                        style={{ borderColor: "var(--border)", background: "var(--card)", scrollbarWidth: "none" }}
                    >
                        <div className="px-4 pt-4 pb-2">
                            <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                                Field Types
                            </p>
                        </div>
                        {/* Palette items are individually sortable so dnd-kit can track them as drag sources */}
                        <SortableContext
                            items={PALETTE.map((p) => `${PALETTE_PREFIX}${p.type}`)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="flex flex-col gap-1.5 px-3 pb-4">
                                {PALETTE.map((item) => (
                                    <PaletteCard key={item.type} item={item} />
                                ))}
                            </div>
                        </SortableContext>
                    </aside>

                    {/* Center — Canvas */}
                    <div
                        className="flex-1 overflow-y-auto p-4 md:p-6"
                        style={{ scrollbarWidth: "none" }}
                    >
                        <div className="max-w-3xl mx-auto flex flex-col gap-3">
                            {fields.length === 0 ? (
                                <CanvasDropHint isOver={isOverCanvas} />
                            ) : (
                                <SortableContext
                                    items={fields.map((f) => f.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {fields.map((field) => (
                                        <SortableFieldRow
                                            key={field.id}
                                            field={field}
                                            isSelected={selectedId === field.id}
                                            onSelect={() => setSelectedId(field.id === selectedId ? null : field.id)}
                                            onDelete={() => deleteField(field.id)}
                                        />
                                    ))}
                                </SortableContext>
                            )}

                            {fields.length > 0 && (
                                <div
                                    className="flex items-center justify-center py-4 rounded-xl border-2 border-dashed transition-all duration-150"
                                    style={{
                                        borderColor: isOverCanvas ? "var(--primary)" : "var(--border)",
                                        background: isOverCanvas ? "var(--accent)" : "transparent",
                                    }}
                                >
                                    <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                                        Drag a field here to append it
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right — Properties */}
                    <aside
                        className="w-full md:w-1/5 shrink-0 border-t md:border-t-0 md:border-l"
                        style={{ borderColor: "var(--border)", background: "var(--card)" }}
                    >
                        {selectedField ? (
                            <PropertiesPanel
                                field={selectedField}
                                onChange={(updates) => updateField(selectedField.id, updates)}
                                onClose={() => setSelectedId(null)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                                <Settings size={28} color="var(--muted-foreground)" style={{ opacity: 0.3 }} />
                                <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                                    Select a field to edit its properties
                                </p>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            {/* Drag overlay — follows the cursor */}
            <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
                {activePaletteItem && (
                    <PaletteCard item={activePaletteItem} overlay />
                )}
                {activeField && (
                    <div style={{ opacity: 0.92, pointerEvents: "none" }}>
                        <FieldRowCard
                            field={activeField}
                            isSelected={false}
                        />
                    </div>
                )}
            </DragOverlay>

            {preview && <PreviewModal fields={fields} onClose={() => setPreview(false)} />}
            {modalStatus.approve && <EmployeeModal onClose={() => {
                const cleanedApprover: ApproverListType[] = approver
                    .filter(item => item.employee_id !== "")
                    .map((item, index) => ({
                        ...item,
                        level: index + 1,
                    }));
                setApprover(cleanedApprover)
                setModalStatus(prev => ({ ...prev, approve: false }))
            }} type="ผู้อนุมัติ" List={approver} />}
            {modalStatus.process && <EmployeeModal onClose={() => {
                const cleanedProcessor: EmployeeList[] = processor
                    .filter(item => item.employee_id !== "")
                setProcessor(cleanedProcessor)
                setModalStatus(prev => ({ ...prev, process: false }))
            }} type="ผู้ดำเนินการ" List={processor} />}
        </DndContext>
    );
}
