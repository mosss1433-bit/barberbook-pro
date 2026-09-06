import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { STATUS_LABELS, formatDate, formatTime, statusClasses } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({
    meta: [
      { title: "การจองของฉัน | THE BLADE Barber Shop" },
      {
        name: "description",
        content: "ดูประวัติการจองคิวตัดผมทั้งหมดของคุณ ตรวจสอบสถานะ และยกเลิกคิวที่ยังไม่ถึงกำหนด",
      },
      { property: "og:title", content: "การจองของฉัน | THE BLADE Barber Shop" },
      { property: "og:description", content: "ตรวจสอบสถานะคิวและยกเลิกการจองได้ด้วยตัวเอง" },
    ],
  }),
  component: MyBookingsPage,
});

function MyBookingsPage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, services(name, price, duration_minutes)")
        .order("booking_date", { ascending: false })
        .order("booking_time", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("ยกเลิกการจองแล้ว");
      await queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      await queryClient.invalidateQueries({ queryKey: ["taken-slots"] });
    },
    onError: () => toast.error("ยกเลิกไม่สำเร็จ"),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">การจองของฉัน</h1>
          <p className="mt-1 text-sm text-muted-foreground">ประวัติและสถานะคิวทั้งหมดของคุณ</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/book">จองคิวใหม่</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : bookings?.length === 0 ? (
        <Card className="surface-panel">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <CalendarDays className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">คุณยังไม่มีการจอง</p>
            <Button asChild>
              <Link to="/book">เริ่มจองคิว</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings?.map((b) => (
            <Card key={b.id} className="surface-panel">
              <CardContent className="flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-40 flex-1">
                  <h2 className="font-semibold">{b.services?.name ?? "บริการ"}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-4" /> {formatDate(b.booking_date)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-4" /> {formatTime(b.booking_time)}
                    </span>
                  </p>
                  {b.notes && <p className="mt-2 text-xs text-muted-foreground">“{b.notes}”</p>}
                </div>

                <span className="font-display text-lg text-primary">
                  ฿{Number(b.services?.price ?? 0).toLocaleString()}
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs ${statusClasses(b.status)}`}
                >
                  {STATUS_LABELS[b.status] ?? b.status}
                </span>

                {(b.status === "pending" || b.status === "confirmed") && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cancel.isPending}
                    onClick={() => cancel.mutate(b.id)}
                  >
                    <X className="size-4" /> ยกเลิก
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
