type Status = "low" | "medium" | "high";

const config: Record<Status, { bg: string; color: string; dot: string, text: string }> = {
    low: { bg: "#d1fae5", color: "#065f46", dot: "#059669", text: "Low Priority" },
    medium: { bg: "#dbeafe", color: "#1e40af", dot: "#3d52d5", text: "Medium Priority" },
    high: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", text: "High Priority" },
};

export function PriorityBadge({ status }: { status: Status }) {
    const c = config[status] ?? config.low;
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
            style={{ background: c.bg, color: c.color, fontSize: "0.75rem", fontWeight: 500 }}
        >
            <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: c.dot }}
            />
            {c.text}
        </span>
    );
}