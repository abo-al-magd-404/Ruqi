"use client";


import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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