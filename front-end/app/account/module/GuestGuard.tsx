"use client";

// GuestGuard - wraps routes that only signed-out users may visit. Authenticated
// users opening such a route are redirected to /account/profile (and render
// nothing meanwhile).
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/tokens/tokens";

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/account/profile");
    }
  }, [router]);

  if (isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}
