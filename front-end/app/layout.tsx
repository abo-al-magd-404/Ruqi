import type { Metadata } from "next";
import { Cairo, Aref_Ruqaa } from "next/font/google";
import SiteChrome from "./educational-content/module/site-chrome";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic"],
  weight: ["700"],
  variable: "--font-aref",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ruqi-five.vercel.app/"),

  title: {
    default: "رُقِيّ | منصة الأستاذ سمير أبو المجد",
    template: "%s | رُقِيّ",
  },

  description:
    "رُقِيّ منصة تعليمية متخصصة في تعليم اللغة العربية للطلاب، مع دروس واختبارات تفاعلية ومحتوى تعليمي منظم بإشراف الأستاذ سمير أبو المجد.",

  verification: {
    google: "r93MBpZ4IhPtlaF9XgNAODkpsF0tjllF3Y0ADBbmeo0",
  },

  keywords: [
    "رُقِيّ",
    "منصة رقي",
    "الأستاذ سمير أبو المجد",
    "سمير أبو المجد",
    "منصة تعليمية",
    "تعلم اللغة العربية",
    "اللغة العربية",
    "النحو والصرف",
    "البلاغة والنقد",
    "المرحلة الإعدادية",
    "المرحلة الثانوية",
    "اختبارات اللغة العربية",
  ],

  authors: [
    {
      name: "الأستاذ سمير أبو المجد",
    },
  ],

  creator: "الأستاذ سمير أبو المجد",
  publisher: "رُقِيّ",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: "رُقِيّ",
    title: "رُقِيّ | منصة الأستاذ سمير أبو المجد",
    description:
      "منصة رُقِيّ التعليمية لتعلم اللغة العربية من خلال محتوى تعليمي منظم ودروس واختبارات تفاعلية.",
    url: "https://YOUR-DOMAIN.com",
  },
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
