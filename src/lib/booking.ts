export const TIME_SLOTS = (() => {
  const slots: string[] = [];
  for (let hour = 10; hour < 20; hour += 1) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    slots.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return slots;
})();

export const STATUS_LABELS: Record<string, string> = {
  pending: "รอดำเนินการ",
  confirmed: "ยืนยันแล้ว",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
};

export const STATUS_ORDER = ["pending", "confirmed", "completed", "cancelled"] as const;

export function statusClasses(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-primary/15 text-primary border-primary/40";
    case "completed":
      return "bg-success/15 text-success border-success/40";
    case "cancelled":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-warning/15 text-warning border-warning/40";
  }
}

export const toDateInput = (d: Date) => {
  const off = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return off.toISOString().slice(0, 10);
};

export const formatTime = (t: string) => t.slice(0, 5);

export const formatDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
