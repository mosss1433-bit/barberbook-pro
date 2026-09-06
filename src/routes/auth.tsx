import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Phone, Scissors, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroImage from "@/assets/barber-hero.jpg";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "เข้าสู่ระบบ | THE BLADE Barber Shop จองคิวตัดผม" },
      {
        name: "description",
        content:
          "เข้าสู่ระบบด้วยชื่อผู้ใช้และเบอร์โทรศัพท์ เพื่อจองคิวตัดผม โกนหนวด และแต่งหนวดเคราที่ THE BLADE Barber Shop",
      },
      { property: "og:title", content: "เข้าสู่ระบบ | THE BLADE Barber Shop" },
      {
        property: "og:description",
        content: "จองคิวร้านตัดผมชายออนไลน์ ง่าย ๆ ด้วยชื่อผู้ใช้และเบอร์โทรศัพท์",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { session, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) void navigate({ to: "/services", replace: true });
  }, [session, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (username.trim().length < 3) {
      toast.error("ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร");
      return;
    }
    if (digits.length < 9) {
      toast.error("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(username, phone);
        toast.success("ยินดีต้อนรับกลับ!");
      } else {
        await signUp(username, phone);
        toast.success("สมัครสมาชิกสำเร็จ");
      }
      await navigate({ to: "/services", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img
          src={heroImage}
          alt="บรรยากาศภายในร้านตัดผม THE BLADE โทนสีดำและแดง"
          width={1600}
          height={912}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-sm">
          <h2 className="text-3xl font-bold">คมทุกทรง เนี้ยบทุกคิว</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            จองคิวล่วงหน้า ไม่ต้องรอ เลือกช่างเวลาที่คุณสะดวก
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="barber-stripe mx-auto h-1.5 w-24 rounded-full" />
          <div className="mt-6 text-center">
            <span className="gradient-primary glow-primary mx-auto flex size-14 items-center justify-center rounded-xl text-primary-foreground">
              <Scissors className="size-7" />
            </span>
            <h1 className="mt-4 text-3xl font-bold">
              THE BLADE<span className="text-primary">.</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin"
                ? "เข้าสู่ระบบเพื่อจองคิวตัดผม"
                : "สมัครสมาชิกใหม่ ใช้เวลาไม่ถึงนาที"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="surface-panel mt-8 space-y-4 rounded-xl p-6">
            <div className="space-y-2">
              <Label htmlFor="username">ชื่อผู้ใช้</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  className="pl-9"
                  placeholder="เช่น somchai"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  className="pl-9"
                  placeholder="0812345678"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={busy || loading}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </Button>

            <button
              type="button"
              className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-primary"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            ใช้เพียงชื่อผู้ใช้และเบอร์โทรศัพท์ ไม่ต้องใช้อีเมลหรือรหัสผ่าน
          </p>
        </div>
      </div>
    </div>
  );
}
