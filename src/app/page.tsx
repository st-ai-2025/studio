
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Force redirect to login page to restart the session.
    router.replace("/login");
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Logo className="h-16 w-16 animate-pulse" />
    </div>
  );
}
