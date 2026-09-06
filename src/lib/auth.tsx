import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = { id: string; username: string; phone: string };

type AuthValue = {
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (username: string, phone: string) => Promise<void>;
  signUp: (username: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

const cleanUsername = (u: string) => u.trim().toLowerCase().replace(/\s+/g, "_");
const emailFor = (u: string) => `${cleanUsername(u)}@barber.local`;
const passwordFor = (phone: string) => `bb-${phone.replace(/\D/g, "")}`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadIdentity(userId: string | undefined) {
    if (!userId) {
      setProfile(null);
      setIsAdmin(false);
      return;
    }
    const [{ data: prof }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, username, phone").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    setProfile(prof ?? null);
    setIsAdmin(!!roles?.some((r) => r.role === "admin"));
  }

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      await loadIdentity(data.session?.user.id);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setSession(next ?? null);
      void loadIdentity(next?.user.id);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      profile,
      isAdmin,
      loading,
      refresh: async () => loadIdentity(session?.user.id),
      signIn: async (username, phone) => {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailFor(username),
          password: passwordFor(phone),
        });
        if (error) throw new Error("ชื่อผู้ใช้หรือเบอร์โทรศัพท์ไม่ถูกต้อง");
      },
      signUp: async (username, phone) => {
        const { data, error } = await supabase.auth.signUp({
          email: emailFor(username),
          password: passwordFor(phone),
        });
        if (error) {
          throw new Error(
            error.message.toLowerCase().includes("already")
              ? "ชื่อผู้ใช้นี้ถูกใช้แล้ว กรุณาเข้าสู่ระบบ"
              : "สมัครสมาชิกไม่สำเร็จ กรุณาลองอีกครั้ง",
          );
        }
        const userId = data.user?.id;
        if (userId) {
          await supabase
            .from("profiles")
            .upsert({ id: userId, username: cleanUsername(username), phone: phone.trim() });
          await loadIdentity(userId);
        }
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
        setIsAdmin(false);
      },
    }),
    [session, profile, isAdmin, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
