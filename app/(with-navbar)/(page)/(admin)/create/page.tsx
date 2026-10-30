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
    ArrowRight,
    Save
} from "lucide-react";
import Select, { MultiValue } from 'react-select'
import { FieldPreview } from "./PreviewRender";
import { useCreateDrafTemplate, useCreateTemplate } from "@/hooks/create-template";
import { useCompanyList, useDivisionList, useEmployeeList } from "@/hooks/create-form";
import { toast } from "react-toastify";
import { Field, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
// ─── Types ────────────────────────────────────────────────────────────────────
interface PaletteItem {
    type: FieldType;
    label: string;
    icon: React.ElementType;
    description: string;
}

const PALETTE: PaletteItem[] = [
    { type: "text", label: "ข้อความสั้น", icon: Type, description: "กรอกข้อความในช่องบรรทัดเดียว เช่น ชื่อหรือรหัส" },
    { type: "textarea", label: "ข้อความหลายบรรทัด", icon: AlignLeft, description: "กรอกรายละเอียดหรือข้อความที่มีความยาวหลายบรรทัด" },
    { type: "number", label: "ตัวเลข", icon: Hash, description: "กรอกข้อมูลที่เป็นตัวเลข เช่น จำนวนหรือราคา" },
    { type: "email", label: "อีเมล", icon: Mail, description: "กรอกที่อยู่อีเมล เช่น name@example.com" },
    { type: "phone", label: "เบอร์โทรศัพท์", icon: Phone, description: "กรอกหมายเลขโทรศัพท์สำหรับติดต่อ" },
    { type: "url", label: "ลิงก์เว็บไซต์", icon: Link, description: "กรอกที่อยู่เว็บไซต์หรือลิงก์ที่ต้องการ" },
    { type: "date", label: "วันที่", icon: Calendar, description: "เลือกวันที่จากปฏิทิน" },
    { type: "select", label: "รายการตัวเลือก", icon: ChevronDown, description: "เลือกคำตอบได้หนึ่งรายการจากตัวเลือก" },
    { type: "radio", label: "ตัวเลือกแบบเลือกคำตอบเดียว", icon: Circle, description: "เลือกคำตอบได้หนึ่งข้อจากตัวเลือกที่แสดง" },
    { type: "checkbox", label: "ช่องทำเครื่องหมาย", icon: CheckSquare, description: "เลือกได้หลายข้อ หรือใช้ระบุว่าทำรายการแล้ว" },
    { type: "toggle", label: "สวิตช์เปิด-ปิด", icon: ToggleLeft, description: "เลือกสถานะเปิดหรือปิด เช่น ใช่หรือไม่ใช่" },
    { type: "file", label: "แนบไฟล์", icon: Paperclip, description: "อัปโหลดไฟล์ประกอบแบบฟอร์ม" },
    { type: "table", label: "ตารางข้อมูล", icon: Table2, description: "กรอกข้อมูลหลายแถว โดยแต่ละแถวมีหลายช่อง" },
    { type: "employee_detail", label: "ข้อมูลพนักงาน", icon: UserSquare2, description: "แสดงข้อมูลพนักงาน เช่น รหัส ชื่อ ฝ่าย และแผนก" },
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
    const isEmployeeDetailField = field.type === 'employee_detail'

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
                <div className={`flex flex-col gap-1.5 ${isEmployeeDetailField ? "hidden" : ""}`}>
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
    const template = useCreateTemplate();
    const draft = useCreateDrafTemplate();
    const { data: divisionList } = useDivisionList();
    const { data: employeeList } = useEmployeeList();
    // Sample data
    // { ...makeField("text"), id: "f1", label: "Full Name", required: true, placeholder: "e.g. Sarah Chen" },
    // { ...makeField("email"), id: "f2", label: "Email Address", required: true, placeholder: "you@company.com" },

    const DEPARTMENT_OPTIONS: { label: string; value: string }[] = divisionList?.map((d: any) => ({ label: d.name == "-" ? "เอกสารสำหรับทุกแผนก" : d.name, value: d.code })) ?? [];

    interface EmployeeList {
        employee_code: string;
        name: string;
    }

    interface ApproverListType {
        employee_code: string;
        name: string;
        level: number;
    }

    interface Options {
        value: string;
        label: string;
    }

    interface ProcessorOptionType extends Options {
        department: string;
    }

    interface ProcessorTypeOption extends Options {
        isDisabled?: boolean;
    }

    const approvalStrategies = [
        { label: "1 ระดับ: หัวหน้างาน (Lv.3)", value: "STEP1" },
        { label: "2 ระดับ: หัวหน้างาน (Lv.3) → ผู้จัดการแผนก (Lv.4)", value: "STEP2" },
        { label: "3 ระดับ: หัวหน้างาน (Lv.3) → ผู้จัดการแผนก (Lv.4) → ผู้จัดการฝ่าย (Lv.6)", value: "STEP3" },
        { label: "4 ระดับ: หัวหน้างาน (Lv.3) → ผู้จัดการแผนก (Lv.4) → ผู้จัดการฝ่าย (Lv.6) → ผู้อำนวยการ (Lv.7)", value: "STEP4" },
        { label: "5 ระดับ: หัวหน้างาน (Lv.3) → ผู้จัดการแผนก (Lv.4) → ผู้จัดการฝ่าย (Lv.6) → ผู้อำนวยการ (Lv.7) → CEO", value: "STEP5" },
    ];

    const [modalStatus, setModalStatus] = useState({
        approve: false,
        process: false,
        finish: false
    });
    const [approver, setApprover] = useState<ApproverListType[]>([
        { level: 1, employee_code: "", name: "" }
    ]);
    const [processor, setProcessor] = useState<EmployeeList[]>([
        { employee_code: "", name: "" }
    ]);
    const [finisher, setFinisher] = useState<EmployeeList>({
        employee_code: "",
        name: ""
    })

    const employeeListOptions: Options[] = employeeList?.map((e: any) => ({ label: e.fullName, value: e.employee_code })) ?? [];

    const ApproverList: Options[] = employeeListOptions

    const ProcessorList: ProcessorOptionType[] = [
        { label: "ทุกคนในแผนกที่เลือก", value: "default", department: "bln" },
        ...(employeeList?.map((e: any) => ({
            label: e.fullName,
            value: e.employee_code,
            department: e.position.division.code,
        })) ?? []),
    ];

    const FinisherList: ProcessorOptionType[] = employeeList?.map((e: any) => ({ label: e.fullName, value: e.employee_code, department: e.position.division.code })) ?? [];

    const [formDetail, setFormDetail] = useState({
        name: "",
        code: "",
        department: "bln",
        iso_no: "",
        have_approver: false,
        approve_strategy: "STEP1",
        processor_type: "SPECIFIC_PROCESSOR"
    })

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
    // Overlay content shown while dragging
    const activePaletteItem = activeId?.startsWith(PALETTE_PREFIX)
        ? PALETTE.find((p) => p.type === activeId.replace(PALETTE_PREFIX, ""))
        : null;
    const activeField = activeId && !activeId.startsWith(PALETTE_PREFIX)
        ? fields.find((f) => f.id === activeId)
        : null;

    const handleRemoveApprover = (index: number) => {
        setApprover((prev) => {
            const remaining = prev.filter((_, i) => i !== index);
            if (remaining.length === 0) {
                return [{ level: 1, employee_code: "", name: "" }];
            }
            return normalizeApproverLevels(remaining);
        });
    };

    const handleRemoveProcessor = (index: number) => {
        setProcessor(
            processor.filter((_, i) => i !== index)
        );
    };

    const normalizeApproverLevels = (approvers: ApproverListType[]) => {
        const orderedLevels = Array.from(new Set(approvers.map((item) => item.level))).sort((a, b) => a - b);
        const normalizedLevels = new Map(orderedLevels.map((level, index) => [level, index + 1]));

        return approvers.map((item) => ({
            ...item,
            level: normalizedLevels.get(item.level) ?? 1,
        }));
    };

    const handleAddApprover = (level: number) => {
        setApprover((prev) => [
            ...prev,
            {
                level,
                employee_code: "",
                name: ""
            },
        ]);
    };

    const handleAddApproverLevel = () => {
        setApprover((prev) => [
            ...prev,
            {
                level: Math.max(0, ...prev.map((item) => item.level)) + 1,
                employee_code: "",
                name: ""
            },
        ]);
    };

    const handleAddProcessor = () => {
        setProcessor((prev) => [
            ...prev,
            {
                employee_code: "",
                name: "",
                department: ""
            },
        ]);
    };

    function getAvailableOptions<T extends Options>(
        currentIndex: number,
        selectedEmployees: { employee_code: string }[],
        options: T[],
        type: "approve" | "process" | "finisher",
    ): T[] {
        const eligibleOptions =
            options.filter((option) => {
                if (option.value === "default") return false;
                if (type === "approve" || formDetail.department === "bln") return true;

                return "department" in option &&
                    option.department === formDetail.department;
            });
        const selectedCodes = selectedEmployees
            .filter((_, index) => index !== currentIndex)
            .map((employee) => employee.employee_code);

        return eligibleOptions.filter((option) => !selectedCodes.includes(option.value));
    }

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
                    <div className="overflow-y-auto p-6 flex flex-col md:min-h-[80vh] gap-5" style={{ scrollbarWidth: "none" }}>
                        <div>
                            {type === "ผู้ดำเนินการ" && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        ประเภทผู้ดำเนินการ
                                    </label>
                                    <Select<ProcessorTypeOption>
                                        options={[
                                            {
                                                label: "1: ทุกคนในแผนก",
                                                value: "ALL_IN_DIVISION",
                                                isDisabled: formDetail.department === "bln",
                                            },
                                            { label: "2: ระบุผู้ดำเนินการ", value: "SPECIFIC_PROCESSOR" },
                                        ]}
                                        value={{
                                            label: formDetail.processor_type === "ALL_IN_DIVISION"
                                                ? "1: ทุกคนในแผนก"
                                                : "2: ระบุผู้ดำเนินการ",
                                            value: formDetail.processor_type,
                                        }}
                                        onChange={(selected) => {
                                            if (selected?.value === "ALL_IN_DIVISION" && formDetail.department !== "bln") {
                                                setFormDetail((prev) => ({ ...prev, processor_type: "ALL_IN_DIVISION" }));
                                                setProcessor([{ employee_code: "default", name: "ทุกคนในแผนก" }]);
                                            } else if (selected?.value === "SPECIFIC_PROCESSOR") {
                                                setFormDetail((prev) => ({ ...prev, processor_type: "SPECIFIC_PROCESSOR" }));
                                                setProcessor([{ employee_code: "", name: "" }]);
                                            }
                                        }}
                                        className="w-full text-sm"
                                    />
                                </div>
                            )}
                            <div className={`space-y-2 ${type === "ผู้อนุมัติ" ? '' : 'hidden'}`}>
                                <div>
                                    <span>{"รูปแบบการอนุมัติ"}</span>
                                </div>
                                <div>
                                    <Select
                                        options={approvalStrategies}
                                        value={approvalStrategies.find(option => option.value === formDetail.approve_strategy) ?? null}
                                        onChange={(selected) => {
                                            if (!selected) return;
                                            setFormDetail(prev => ({ ...prev, approve_strategy: selected.value }));
                                        }}
                                    />
                                </div>
                            </div>
                            <div className={`${type === "ผู้อนุมัติ" ? 'mt-8' : ''}`}>
                                <div className={`flex justify-start space-x-4 mt-4 ${type === "ผู้อนุมัติ" ? '' : 'hidden'}`}>
                                    <Field orientation="horizontal" className="w-auto">
                                        <FieldLabel htmlFor="show" className="text-md">{'เลือกผู้อนุมัติเพิ่มสำหรับเอกสาร'}</FieldLabel>
                                        <Checkbox
                                            id="show"
                                            checked={formDetail.have_approver}
                                            onCheckedChange={(checked) => setFormDetail(prev => ({ ...prev, have_approver: checked }))}
                                        />
                                    </Field>
                                </div>
                                {type === "ผู้อนุมัติ" && formDetail.have_approver && (
                                    <div className="mt-6 space-y-4">
                                        {Array.from(new Set<number>(List.map((item: ApproverListType) => item.level)))
                                            .sort((a, b) => a - b)
                                            .map((level) => {
                                                const levelApprovers = List
                                                    .map((item: ApproverListType, index: number) => ({ item, index }))
                                                    .filter(({ item }: { item: ApproverListType }) => item.level === level);

                                                return (
                                                    <section key={level} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                            <div>
                                                                <h3 className="text-sm font-semibold text-slate-900">ระดับ {level}</h3>
                                                                <p className="mt-0.5 text-xs text-slate-500">ผู้อนุมัติในกลุ่มนี้อยู่ในระดับเดียวกัน</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddApprover(level)}
                                                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                            >
                                                                <Plus size={14} aria-hidden="true" />
                                                                เพิ่มผู้อนุมัติในระดับนี้
                                                            </button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {levelApprovers.map(({ item, index }: { item: ApproverListType; index: number }, levelIndex: number) => (
                                                                <div key={`${level}-${index}`} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                                                    <label className="w-full text-sm font-medium text-slate-700 sm:max-w-36">
                                                                        ผู้อนุมัติ {levelIndex + 1}
                                                                        <span className="sr-only"> ระดับ {level}</span>
                                                                    </label>
                                                                    <Select
                                                                        inputId={`approver-${level}-${index}`}
                                                                        defaultInputValue=""
                                                                        placeholder="เลือกผู้อนุมัติ"
                                                                        className="min-w-0 flex-1 rounded-lg basic-multi-select"
                                                                        options={getAvailableOptions(index, approver, ApproverList, "approve")}
                                                                        value={ApproverList.find((option) => option.value === item.employee_code) ?? null}
                                                                        onChange={(selected) => {
                                                                            setApprover((prev) => prev.map((approverItem, approverIndex) =>
                                                                                approverIndex === index
                                                                                    ? {
                                                                                        ...approverItem,
                                                                                        employee_code: selected?.value ?? "",
                                                                                        name: selected?.label ?? "",
                                                                                    }
                                                                                    : approverItem,
                                                                            ));
                                                                        }}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveApprover(index)}
                                                                        aria-label={`ลบผู้อนุมัติระดับ ${level} คนที่ ${levelIndex + 1}`}
                                                                        className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-rose-200 px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                                                    >
                                                                        ลบ
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </section>
                                                );
                                            })}
                                        <button
                                            type="button"
                                            onClick={handleAddApproverLevel}
                                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 px-4 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                        >
                                            <Plus size={16} aria-hidden="true" />
                                            เพิ่มระดับอนุมัติ
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {type == "ผู้ดำเนินการ" && processor[0]?.employee_code !== "default" && List.map((app: any, index: number) => (
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
                                    placeholder="โปรดเลือกผู้ดำเนินการเอกสาร"
                                    className="md:w-1/2 rounded-lg basic-multi-select"
                                    options={getAvailableOptions(index, processor, ProcessorList, "process")}
                                    value={ProcessorList.find(
                                        (option) => option.value === processor[index].employee_code,
                                    ) ?? null}
                                    onChange={(selected) => {
                                        setProcessor(prev =>
                                            prev.map((item, i) =>
                                                i === index
                                                    ? {
                                                        ...item,
                                                        employee_code: selected?.value ?? "",
                                                        name: selected?.label ?? "",
                                                        department: selected?.department ?? ""
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

    interface BaseField {
        id: string;
        type: string;
        label: string;
        placeholder?: string;
        required: boolean;
        helpText: string;
        width: string;
        option?: string;
    }

    const MAIN_KEYS = [
        "id",
        "type",
        "label",
        "placeholder",
        "required",
        "helpText",
        "width",
    ] as const;
    interface BaseField {
        id: string;
        type: string;
        label: string;
        placeholder?: string;
        required: boolean;
        helpText: string;
        width: string;
        option?: string | undefined;
    }

    function normalizeField(field: Record<string, any>): BaseField {
        const main: Record<string, any> = {};
        const extra: Record<string, any> = {};

        for (const key of Object.keys(field)) {
            if (MAIN_KEYS.includes(key as any)) {
                main[key] = field[key];
            } else {
                extra[key] = field[key];
            }
        }

        const result: BaseField = { ...main } as BaseField;

        if (Object.keys(extra).length > 0) {
            result.option = JSON.stringify(extra);
        }

        return result;
    }

    function normalizeFields(fields: Record<string, any>[]): BaseField[] {
        return fields.map(normalizeField);
    }

    function validate(data: any): boolean {
        const status = {
            name: { status: false, msg: "" },
            division: { status: false, msg: "" },
            fields: { status: false, msg: "" },
            processor: { status: false, msg: "" },
            finisher: { status: false, msg: "" },
        };

        if (!data.form.name.trim()) {
            status.name = { status: true, msg: "ยังไม่ได้ตั้งชื่อเอกสาร" };
        }

        if (!data.form.division_code) {
            status.division = { status: true, msg: "ยังไม่ได้เลือกแผนก" };
        }

        if (data.form.fields.length === 0) {
            status.fields = { status: true, msg: "เพิ่มฟิลด์อย่างน้อย 1 ฟิลด์" };
        }

        if (!data.workflow.processor.some((item: any) => item.employee_code)) {
            status.processor = { status: true, msg: "ต้องเลือกผู้ดำเนินการอย่างน้อย 1 คน" };
        }

        if (!data.workflow.finisher.employee_code) {
            status.finisher = { status: true, msg: "ยังไม่ได้เลือกผู้สิ้นสุดเอกสาร" };
        }

        const errors = Object.values(status).filter((item) => item.status);

        errors.forEach((item) => toast.error(item.msg));

        return errors.length === 0;
    }

    function checkProcessor(processor: EmployeeList[]) {
        const isEveryone = processor.find((pro) => pro.employee_code === "default")

        if(isEveryone) {
            return [{employee_code: "default", name: "ทุกคนในแผนก"}]
        }

        return processor
    }

    async function saveForm() {
        const newFields = normalizeFields(fields);

        const data = {
            form: {
                name: formDetail.name.trim(),
                division_code: formDetail.department,
                iso_no: formDetail.iso_no,
                fields: newFields,
            },
            workflow: {
                name: formDetail.name.trim(),
                division_code: formDetail.department,
                approve_format: formDetail.approve_strategy,
                approver: formDetail.have_approver
                    ? normalizeApproverLevels(approver.filter((item) => item.employee_code))
                    : undefined,
                processor_type: formDetail.processor_type,
                processor: checkProcessor(processor),
                finisher: finisher
            }
        }
        if (!validate(data)) return;
        template.mutate(data)
    }

    async function saveDraft() {
        const newFields = normalizeFields(fields);

        const data = {
            form: {
                name: formDetail.name.trim(),
                divisionId: formDetail.department,
                iso_no: formDetail.iso_no,
                fields: newFields,
            },
            workflow: {
                name: formDetail.name.trim(),
                approver: formDetail.have_approver
                    ? normalizeApproverLevels(approver.filter((item) => item.employee_code))
                    : undefined,
                processor: checkProcessor(processor),
                finisher: finisher
            }
        }

        if (!validate(data)) return;
        draft.mutate(data)
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

                {/* Form setup and workflow */}
                <div
                    className="w-full border-b px-4 py-5 sm:px-6 lg:px-8"
                    style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                    <div className="mx-auto flex max-w-[1600px] flex-col gap-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
                                    Form builder
                                </p>
                                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                                    {"สร้างรูปแบบเอกสารใหม่"}
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    ตั้งค่าข้อมูลเอกสารและผู้รับผิดชอบก่อนออกแบบฟอร์ม
                                </p>
                            </div>
                            <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600">
                                <span className="flex size-7 items-center justify-center rounded-lg bg-white font-semibold text-indigo-700 shadow-sm">
                                    {fields.length}
                                </span>
                                <span>ฟิลด์ในแบบฟอร์ม</span>
                            </div>
                        </div>

                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                            <div className="mb-4">
                                <h2 className="text-sm font-semibold text-slate-900">ข้อมูลเอกสาร</h2>
                                <p className="mt-1 text-xs text-slate-500">รายละเอียดที่จะแสดงให้ผู้ใช้งานเห็น</p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                                    ชื่อเอกสาร <span className="text-rose-600" aria-label="จำเป็น">*</span>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="เช่น แบบฟอร์มขออนุมัติ"
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100"
                                        value={formDetail.name}
                                        onChange={e => setFormDetail(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                                    แผนกเจ้าของเอกสาร <span className="text-rose-600" aria-label="จำเป็น">*</span>
                                    <Select
                                        <{ label: string; value: string }>
                                        options={DEPARTMENT_OPTIONS}
                                        value={DEPARTMENT_OPTIONS.find(option => option.value === formDetail.department) ?? null}
                                        placeholder="เลือกแผนก"
                                        onChange={(selected) => {
                                            if (!selected) return;
                                            if (selected.value === "bln" && formDetail.processor_type === "1") {
                                                setProcessor([{ employee_code: "", name: "" }]);
                                            }
                                            setFormDetail(prev => ({
                                                ...prev,
                                                department: selected.value,
                                                processor_type: selected.value === "bln" ? "2" : prev.processor_type,
                                            }));
                                        }}
                                        className="w-full text-sm"
                                        classNames={{
                                            control: () => "!min-h-10 !rounded-lg !border-slate-200 !shadow-none hover:!border-slate-300",
                                            placeholder: () => "!text-slate-400",
                                            menu: () => "!z-20",
                                        }}
                                    />
                                </label>
                                <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                                    หมายเลขอ้างอิง ISO <span className="font-normal text-slate-400">(ไม่บังคับ)</span>
                                    <input
                                        type="text"
                                        placeholder="เช่น ISO-001"
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100"
                                        value={formDetail.iso_no}
                                        onChange={e => setFormDetail(prev => ({ ...prev, iso_no: e.target.value }))}
                                    />
                                </label>
                            </div>
                        </section>

                        <section>
                            <div className="mb-3">
                                <h2 className="text-sm font-semibold text-slate-900">กำหนดผู้รับผิดชอบ</h2>
                                <p className="mt-1 text-xs text-slate-500">เลือกบุคลากรในแต่ละขั้นตอนของการดำเนินเอกสาร</p>
                            </div>
                            <div className="grid gap-3 xl:grid-cols-3">
                                <div className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-bold text-violet-700">1</span>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-semibold text-slate-900">ผู้อนุมัติ</h3>
                                            <p className="mt-0.5 text-xs text-slate-500">ตรวจสอบและอนุมัติเอกสาร</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                            onClick={() => setModalStatus(prev => ({ ...prev, approve: true }))}
                                        >
                                            <Plus size={14} aria-hidden="true" />
                                            แก้ไข
                                        </button>
                                    </div>
                                    <div className="mt-4 min-h-12 rounded-xl bg-slate-50 p-3">
                                        <div className="mb-3">
                                            <p className="text-[14px] font-medium uppercase tracking-wide text-slate-500">
                                                รูปแบบการอนุมัติ
                                            </p>
                                            <p className="mt-1 text-md font-medium leading-5 text-violet-800">
                                                {approvalStrategies.find(option => option.value === formDetail.approve_strategy)?.label ?? formDetail.approve_strategy}
                                            </p>
                                        </div>
                                        {approver[0].employee_code !== "" ? (
                                            <div className="space-y-2">
                                                {Array.from(new Set(approver
                                                    .filter((item) => item.employee_code)
                                                    .map((item) => item.level)))
                                                    .sort((a, b) => a - b)
                                                    .map((level, levelIndex) => (
                                                        <div key={level} className="flex flex-wrap items-center gap-2">
                                                            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                                ระดับ {level}
                                                            </span>
                                                            {approver
                                                                .filter((item) => item.level === level && item.employee_code)
                                                                .map((item) => (
                                                                    <span key={`${level}-${item.employee_code}`} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700">
                                                                        {item.name}
                                                                    </span>
                                                                ))}
                                                            {levelIndex < new Set(approver
                                                                .filter((item) => item.employee_code)
                                                                .map((item) => item.level)).size - 1 && (
                                                                    <ArrowRight size={14} className="text-slate-400" aria-hidden="true" />
                                                                )}
                                                        </div>
                                                    ))}
                                            </div>
                                        ) : (
                                            <p className="flex min-h-6 items-center text-xs text-slate-500">ยังไม่ได้เพิ่มผู้อนุมัติ</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-bold text-sky-700">2</span>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-semibold text-slate-900">ผู้ดำเนินการ</h3>
                                            <p className="mt-0.5 text-xs text-slate-500">จัดการคำร้องและเอกสาร</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                            onClick={() => setModalStatus(prev => ({ ...prev, process: true }))}
                                        >
                                            <Plus size={14} aria-hidden="true" />
                                            เพิ่ม
                                        </button>
                                    </div>
                                    <div className="mt-4 min-h-12 rounded-xl bg-slate-50 p-3">
                                        {processor[0].employee_code !== "" ? (
                                            <div className="flex flex-wrap gap-2">
                                                {processor.map((item, index) => (
                                                    <span key={index} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700">
                                                        {item.name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="flex min-h-6 items-center text-xs text-slate-500">ยังไม่ได้เพิ่มผู้ดำเนินการ</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">3</span>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm font-semibold text-slate-900">ผู้สิ้นสุดเอกสาร</h3>
                                            <p className="mt-0.5 text-xs text-slate-500">รับช่วงต่อเมื่อดำเนินการเสร็จ</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <Select
                                            defaultInputValue=""
                                            placeholder="เลือกผู้สิ้นสุดเอกสาร"
                                            className="w-full text-sm"
                                            classNames={{
                                                control: () => "!min-h-10 !rounded-lg !border-slate-200 !shadow-none hover:!border-slate-300",
                                                placeholder: () => "!text-slate-400",
                                                menu: () => "!z-20",
                                            }}
                                            options={getAvailableOptions(0, [finisher], FinisherList, "finisher")}
                                            value={FinisherList.find(option => option.value === finisher.employee_code) ?? null}
                                            onChange={(selected) => {
                                                if (!selected) return;
                                                setFinisher({ employee_code: selected.value, name: selected.label });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-slate-500">
                                เพิ่มฟิลด์จากแถบด้านซ้าย แล้วเลือกฟิลด์เพื่อแก้ไขรายละเอียด
                            </p>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => setPreview(true)}
                                    className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <Eye size={15} aria-hidden="true" />
                                    ดูตัวอย่าง
                                </button>
                                <button
                                    type="button"
                                    className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    onClick={() => saveDraft()}
                                >
                                    บันทึกฉบับร่าง
                                </button>
                                <button
                                    type="button"
                                    className="flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                    style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                                    onClick={() => saveForm()}
                                >
                                    <Save size={15} aria-hidden="true" />
                                    บันทึกแบบฟอร์ม
                                </button>
                            </div>
                        </div>
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
            {modalStatus.approve && (
                <EmployeeModal
                    onClose={() => {
                        if (!formDetail.have_approver) {
                            setApprover([{ level: 1, employee_code: "", name: "" }]);
                        } else {
                            setApprover((prev) => {
                                const validApprovers = prev.filter((item) => item.employee_code);
                                return validApprovers.length > 0 ? normalizeApproverLevels(validApprovers)
                                    : [{ level: 1, employee_code: "", name: "" }];
                            });
                        }
                        setModalStatus((prev) => ({ ...prev, approve: false }));
                    }}
                    type="ผู้อนุมัติ"
                    List={approver}
                />
            )}

            {modalStatus.process && (
                <EmployeeModal
                    onClose={() => {
                        setProcessor((prev) => {
                            const validProcessor = prev.filter((item) => item.employee_code);
                            return validProcessor.length > 0 ? validProcessor : [{ employee_code: "", name: "" }];
                        });
                        setModalStatus((prev) => ({ ...prev, process: false }));
                    }}
                    type="ผู้ดำเนินการ"
                    List={processor}
                />
            )}
        </DndContext>
    );
}
