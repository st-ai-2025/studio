
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/Logo";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/chat");
      } else {
        if (bypassAuth) {
            router.replace("/login");
        } else {
            router.replace("/login");
        }
      }
    }
  }, [user, loading, router, bypassAuth]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Logo className="h-16 w-16 animate-pulse" />
    </div>
  );
}
