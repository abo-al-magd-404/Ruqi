"use client";

// Layout wrapper for the educational-content area.
// Hides the site navbar/footer on full-screen flow pages (taking an exam,
// showing a result, reviewing answers, doing an assignment).

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Routes matching this pattern render without the site chrome:
// exam take/result/review, assignment and its result/review, and avatar choice.
const HIDDEN_CHROME_RE =
  /^\/educational-content\/exam\/[^/]+\/(take|result|review)(\/|$)|^\/educational-content\/content\/[^/]+\/assignment(\/(result|review))?(\/|$)|^\/account\/choose-avatar(\/|$)/;

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hidden = HIDDEN_CHROME_RE.test(pathname ?? "");

  if (hidden) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}