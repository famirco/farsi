"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/placement-test");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center text-xs font-bold text-[#6b6a63]">
      Redirecting to Placement Test...
    </div>
  );
}
