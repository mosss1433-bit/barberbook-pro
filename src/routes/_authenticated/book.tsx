import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarDays, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { TIME_SLOTS, formatDate, toDateInput } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/book")({
  head: () => ({
    meta: [
      { title: "จองคิวตัดผม | THE BLADE Barber Shop" },
      {
        name: "description",
        content:
          "เลือกบริการ วันที่ และเวลาที่ว่าง เพื่อจองคิวตัดผมกับ THE BLADE Barber Shop ระบบป้องกันการจองเวลาซ้ำอัตโนมัติ",
      },
      { property: "og:title", content: "จองคิวตัดผม | THE BLADE Barber Shop" },
      {
        property: "og:description",
        content: "เลือกบริการ วันที่ และช่วงเวลาว่าง แล้วยืนยันการจองได้ทันที",
      },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = toDateInput(new Date());

  const [serviceId, setServiceId] = useState<string>("");
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const { data: services } = useQuery({
    queryKey: ["services", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("price");
      if (error) throw error;
      return data;
    },
  });

  const { data: taken, isLoading: loadingSlots } = useQuery({
    queryKey: ["taken-slots", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("booking_time")
        .eq("booking_date", date)
        .neq("status", "cancelled");
      if (error) throw error;
      return data.map((b) => b.booking_time.slice(0, 5));
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!serviceId) throw new Error("กรุณาเลือกบริการ");
      if (!time) throw new Error("กรุณาเลือกเวลา");
      const { error } = await supabase.from("bookings").insert({
        user_id: session!.user.id,
        service_id: serviceId,
        customer_name: profile?.username ?? "",
        customer_phone: profile?.phone ?? "",
        booking_date: date,
        booking_time: `${time}:00`,
        notes,
      });
      if (error) {
        throw new Error(
          error.code === "23505" || error.message.includes("duplicate")
            ? "เวลานี้ถูกจองไปแล้ว กรุณาเลือกเวลาอื่น"
            : "จองคิวไม่สำเร็จ กรุณาลองอีกครั้ง",
        );
      }
    },
    onSuccess: async () => {
      toast.success("จองคิวสำเร็จ!");
      await queryClient.invalidateQueries({ queryKey: ["taken-slots"] });
      await queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      await navigate({ to: "/bookings" });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด"),
  });

  const selected = services?.find((s) => s.id === serviceId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">จองคิว</h1>
        <p className="mt-1 text-sm text-muted-foreground">เลือกบริการ วันที่ และเวลาที่ต้องการ</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              1. เลือกบริการ
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {services?.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setServiceId(s.id)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    serviceId === s.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{s.name}</span>
                    <span className="font-display text-primary">
                      ฿{Number(s.price).toLocaleString()}
                    </span>
                  </div>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3.5" /> {s.duration_minutes} นาที
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              2. เลือกวันที่
            </h2>
            <Input
              type="date"
              min={today}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTime("");
              }}
              className="max-w-xs"
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              3. เลือกเวลา
            </h2>
            {loadingSlots ? (
              <p className="text-sm text-muted-foreground">กำลังตรวจสอบเวลาว่าง...</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {TIME_SLOTS.map((slot) => {
                  const isTaken = taken?.includes(slot);
                  const isPast = date === today && slot <= new Date().toTimeString().slice(0, 5);
                  const disabled = isTaken || isPast;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={disabled}
                      onClick={() => setTime(slot)}
                      className={`rounded-lg border py-2 text-sm transition-colors ${
                        time === slot
                          ? "border-primary bg-primary text-primary-foreground"
                          : disabled
                            ? "cursor-not-allowed border-border bg-muted text-muted-foreground/50 line-through"
                            : "border-border bg-card hover:border-primary/60"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <Label htmlFor="notes">หมายเหตุ (ไม่บังคับ)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น ต้องการทรงสกินเฟด"
            />
          </section>
        </div>

        <Card className="surface-panel h-fit lg:sticky lg:top-24">
          <CardContent className="space-y-4 p-5">
            <h2 className="font-semibold">สรุปการจอง</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">บริการ</dt>
                <dd className="text-right">{selected?.name ?? "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">วันที่</dt>
                <dd className="text-right">{formatDate(date)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">เวลา</dt>
                <dd className="text-right">{time || "-"}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-2">
                <dt className="text-muted-foreground">ราคารวม</dt>
                <dd className="font-display text-lg text-primary">
                  ฿{selected ? Number(selected.price).toLocaleString() : 0}
                </dd>
              </div>
            </dl>
            <Button
              className="w-full"
              disabled={create.isPending || !serviceId || !time}
              onClick={() => create.mutate()}
            >
              {create.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              ยืนยันการจอง
            </Button>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" /> เวลาที่มีขีดฆ่าคือคิวที่ถูกจองแล้ว
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
