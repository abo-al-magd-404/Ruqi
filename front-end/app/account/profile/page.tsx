"use client";

// Profile route guard. Uses a synchronous auth snapshot to redirect guests to
// /account (with a brief "checking" state), then renders the actual profile
// (StudentProfile) for authenticated users.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import StudentProfile from "./module/profile";
import { isAuthenticated } from "@/lib/tokens/tokens";

const subscribe = () => () => {};

export default function ProfilePage() {
  const router = useRouter();
  const isLoggedIn = useSyncExternalStore(
    subscribe,
    () => isAuthenticated(),
    () => false,
  );

  useEffect(() => {
    if (!isLoggedIn) router.replace("/account");
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center ">
        <span className="text-text-muted font-medium">جاري التحقق...</span>
      </div>
    );
  }

  return <StudentProfile />;
}
