import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Scissors } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import heroImage from "@/assets/barber-hero.jpg";

export const Route = createFileRoute("/_authenticated/services")({
  head: () => ({
    meta: [
      { title: "บริการและราคา | THE BLADE Barber Shop" },
      {
        name: "description",
        content:
          "ดูรายการบริการตัดผมชาย โกนหนวดผ้าร้อน แต่งหนวดเครา พร้อมราคาและระยะเวลาของ THE BLADE Barber Shop",
      },
      { property: "og:title", content: "บริการและราคา | THE BLADE Barber Shop" },
      {
        property: "og:description",
        content: "ตัดผม โกนหนวด แต่งหนวดเครา พร้อมราคาและระยะเวลาที่ชัดเจน",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services, isLoading } = useQuery({
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

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border">
        <img
          src={heroImage}
          alt="ร้านตัดผม THE BLADE โทนดำแดง"
          width={1600}
          height={912}
          className="h-56 w-full object-cover md:h-72"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center gap-3 p-6 md:p-10">
          <span className="w-fit rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">
            เปิดทุกวัน 10:00 - 20:00
          </span>
          <h1 className="max-w-md text-3xl font-bold leading-tight md:text-4xl">
            ตัดผมชายระดับพรีเมียม <span className="text-primary">จองคิวออนไลน์</span>
          </h1>
          <Button asChild className="w-fit">
            <Link to="/book">จองคิวเลย</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">บริการของเรา</h2>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services?.map((s) => (
              <Card key={s.id} className="surface-panel border-border transition-colors hover:border-primary/60">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <Scissors className="size-4" />
                    </span>
                    <span className="font-display text-xl font-semibold text-primary">
                      ฿{Number(s.price).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{s.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-4" /> {s.duration_minutes} นาที
                    </span>
                    <Link to="/book" className="text-primary hover:underline">
                      จองบริการนี้
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            {services?.length === 0 && (
              <p className="text-sm text-muted-foreground">ยังไม่มีบริการที่เปิดให้บริการ</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
