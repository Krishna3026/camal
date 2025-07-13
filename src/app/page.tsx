"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
      <div className="flex items-center gap-2 text-2xl font-headline font-bold text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
            <path d="M4.5 15.5L3 21"></path>
            <path d="M19.5 15.5L21 21"></path>
            <path d="M13 8.5c0-2.5-1.5-4-3.5-4s-3.5 1.5-3.5 4"></path>
            <path d="M12.5 11.5L14 15.5H5L6.5 11.5Z"></path>
            <path d="M18 11.5c0-2.5-1.5-4-3.5-4"></path>
            <path d="M17.5 11.5L19 15.5"></path>
        </svg>
        <span>Camal</span>
      </div>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading your workspace...</p>
    </div>
  );
}
