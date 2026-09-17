"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getEducationalMonthById } from "@/lib/educational-content/months";
import { getEducationalStageById } from "@/lib/educational-content/stages";
import { getContentById } from "@/lib/educational-content/content";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const ROOT = { label: "المحتوى التعليمي", href: "/educational-content" };

export default function ContentBreadcrumb() {
  const pathname = usePathname();
  const [items, setItems] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    let active = true;
    const segments = (pathname ?? "").split("/").filter(Boolean);

    const build = async () => {
      if (segments.length === 0 || segments[0] !== "educational-content") {
        if (active) setItems([]);
        return;
      }

      const [, route, id] = segments;
      const trail: BreadcrumbItem[] = [ROOT];

      if (route === "month" && id) {
        const month = await getEducationalMonthById(id).catch(() => null);
        if (month?.stage) {
          const stage = await getEducationalStageById(String(month.stage)).catch(() => null);
          if (stage) {
            trail.push({ label: stage.title, href: `/educational-content/stage/${stage._id}` });
          }
        }
      } else if ((route === "content" || route === "exam") && id) {
        const content = await getContentById(id).catch(() => null);
        if (content?.month) {
          const month = await getEducationalMonthById(String(content.month)).catch(() => null);
          if (month) {
            const stage = month.stage
              ? await getEducationalStageById(String(month.stage)).catch(() => null)
              : null;
            if (stage) {
              trail.push({ label: stage.title, href: `/educational-content/stage/${stage._id}` });
            }
            trail.push({ label: month.title, href: `/educational-content/month/${month._id}` });
          }
        }
      }

      if (active) setItems(trail);
    };

    build();
    return () => {
      active = false;
    };
  }, [pathname]);

  if (items.length === 0) return null;

  const lastIndex = items.length - 1;

  return (
    <nav
      className="flex flex-row items-center justify-start gap-2 w-full text-xs md:text-sm text-text-muted flex-wrap"
      aria-label="مسار التنقل"
    >
      {items.map((item, index) => {
        const isLast = index === lastIndex;
        return (
          <span key={item.label + index} className="flex items-center gap-2">
            {index > 0 && <span>&gt;</span>}
            {isLast ? (
              <Link
                href={item.href ?? ROOT.href!}
                className="font-bold text-primary hover:underline transition-colors text-xs md:text-sm"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-text-muted text-xs md:text-sm">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}