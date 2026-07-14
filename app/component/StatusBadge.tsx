type Status = "Draft" | "Approved" | "Processing" | "Completed" | "Cancelled" | "Pending" | "Rejected";

const config: Record<Status, { bg: string; color: string; dot: string }> = {
  Draft:      { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  Pending:    { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  Approved:   { bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
  Processing: { bg: "#dbeafe", color: "#1e40af", dot: "#3d52d5" },
  Completed:  { bg: "#d1fae5", color: "#065f46", dot: "#059669" },
  Cancelled:  { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
  Rejected:   { bg: "#d6d6d6", color: "#000000", dot: "#000000" }
};

export function StatusBadge({ status }: { status: Status }) {
  const c = config[status] ?? config.Draft;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.color, fontSize: "0.75rem", fontWeight: 500 }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: c.dot }}
      />
      {status}
    </span>
  );
}