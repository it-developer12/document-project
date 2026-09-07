// ─── Employee Detail block ────────────────────────────────────────────────────

import { Hash } from "lucide-react";

export function EmployeeDetailPreview() {
    const inputCls: React.CSSProperties = {
        width: "100%",
        padding: "0.375rem 0.625rem",
        border: "1px solid var(--border)",
        borderRadius: "0.375rem",
        background: "var(--input-background)",
        color: "var(--foreground)",
        fontSize: "0.8rem",
        outline: "none",
    };

    const labelCls: React.CSSProperties = {
        fontSize: "0.78rem",
        fontWeight: 600,
        color: "var(--foreground)",
        marginBottom: "0.375rem",
        display: "block",
    };

    const required = (
        <span style={{ color: "var(--destructive)", marginLeft: "0.2rem" }}>*</span>
    );

    return (
        <div
            className="flex flex-col gap-4 p-4 rounded-lg border"
            style={{ borderColor: "var(--border)", background: "var(--secondary)" }}
        >
            {/* Row 1: Employee Code | Position | Division | Department */}
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                {/* รหัสพนักงาน — Employee Code with search button */}
                <div>
                    <label style={labelCls}>รหัสพนักงาน (Employee Code){required}</label>
                    <div className="flex gap-1.5">
                        <input
                            type="text"
                            placeholder="รหัสพนักงาน"
                            style={{ ...inputCls, flex: 1 }}
                            readOnly
                        />
                        <button
                            className="flex items-center justify-center px-2.5 rounded-lg shrink-0 transition-opacity hover:opacity-80"
                            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                            tabIndex={-1}
                        >
                            <Hash size={13} />
                        </button>
                    </div>
                </div>

                {/* ตำแหน่ง — Position */}
                <div>
                    <label style={labelCls}>ตำแหน่ง (Position){required}</label>
                    <input type="text" placeholder="ตำแหน่ง" style={inputCls} readOnly />
                </div>

                {/* ฝ่าย — Division */}
                <div>
                    <label style={labelCls}>ฝ่าย (Division){required}</label>
                    <input type="text" placeholder="ฝ่าย" style={inputCls} readOnly />
                </div>

                {/* แผนก — Department */}
                <div>
                    <label style={labelCls}>แผนก (Department){required}</label>
                    <input type="text" placeholder="แผนก" style={inputCls} readOnly />
                </div>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "var(--border)" }} />

            {/* Row 2: First Name | Last Name | Company */}
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                {/* ชื่อ — First Name */}
                <div>
                    <label style={labelCls}>ชื่อ (First Name){required}</label>
                    <input type="text" placeholder="ชื่อ" style={inputCls} readOnly />
                </div>

                {/* นามสกุล — Last Name */}
                <div>
                    <label style={labelCls}>นามสกุล (Last Name){required}</label>
                    <input type="text" placeholder="นามสกุล" style={inputCls} readOnly />
                </div>

                {/* บริษัท — Company (select) */}
                <div>
                    <label style={labelCls}>บริษัท (Company){required}</label>
                    <select style={{ ...inputCls, appearance: "none", cursor: "default" }} disabled>
                        <option value="">บริษัท</option>
                    </select>
                </div>
            </div>

            {/* Auto-fill hint */}
            <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginTop: "-0.5rem" }}>
                Fields are auto-filled when an Employee Code is searched.
            </p>
        </div>
    );
}