"use client";

// Breadcrumb for the educational-content area.
// Infers the trail (home → stage → month → content) from the current route and
// resolves titles by fetching each ancestor entity as needed.

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

      // The relevant route shapes are educational-content/{stage|month|content|exam}/<id>.
    // Depending on the segment we walk up the hierarchy to build the trail.
      const [, route, id] = segments;
      const trail: BreadcrumbItem[] = [ROOT];

      if (route === "stage" && id) {
        const stage = await getEducationalStageById(id).catch(() => null);
        if (stage) {
          trail.push({ label: stage.title });
        }
      } else if (route === "month" && id) {
        const month = await getEducationalMonthById(id).catch(() => null);
        if (month?.stage) {
          const stage = await getEducationalStageById(String(month.stage)).catch(() => null);
          if (stage) {
            trail.push({ label: stage.title, href: `/educational-content/stage/${stage._id}` });
          }
        }
        if (month) {
          trail.push({ label: month.title });
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
        if (content) {
          trail.push({ label: content.title });
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
              <span
                className="font-bold text-primary text-xs md:text-sm max-w-[220px] md:max-w-[300px] truncate"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href ?? ROOT.href!}
                className="font-medium text-text-muted hover:text-primary transition-colors text-xs md:text-sm"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}