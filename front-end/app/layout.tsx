// Root layout: global metadata (title/description/keywords), Arabic Google fonts
// (Cairo + Aref Ruqaa) exported as CSS variables, lang="ar" + dir="rtl", and the
// shared SiteChrome wrapper that renders the navbar and footer around every page.
import type { Metadata } from "next";
import { Cairo, Aref_Ruqaa } from "next/font/google";
import SiteChrome from "./educational-content/module/site-chrome";
import "./globals.css";

// Primary UI font; exposed as the --font-cairo CSS variable used by font-cairo.
const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

// Decorative display font for the "رُقِيّ" wordmark; variable --font-aref.
const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic"],
  weight: ["700"],
  variable: "--font-aref",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "رقي | منصة الاستاذ سمير ابو المجد",
    template: "%s | رُقِيّ",
  },
  description:
    "رُقِيّ منصة تعليمية عربية متكاملة تهدف إلى تقديم تجربة تعليمية منظمة وفعّالة، من خلال محتوى تعليمي متخصص، دروس واختبارات تفاعلية، ومتابعة مستمرة لمستوى الطلاب وتقدمهم.",
  keywords: [
    "رُقِيّ",
    "منصة رقي",
    "الاستاذ سمير ابو المجد",
    "منصة تعليمية",
    "تعلم اللغة العربية",
    "المرحلة الثانوية",
    "المرحلة المتوسطة",
    "المرحلة الاعدادية",
    "المرحلة الابتدائية",
    "النحو والصرف",
    "البلاغة والنقد",
    "اختبارات تفاعلية",
  ],
  authors: [{ name: "الاستاذ سمير ابو المجد" }],
  robots: "index, follow",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${arefRuqaa.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-background text-text-main font-cairo antialiased selection:bg-primary selection:text-white">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}