"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, type Variants } from "framer-motion";
import {
  Crown,
  Calendar,
  LineChart,
  FileCheck2,
  BookOpenCheck,
  Target,
  Trophy,
  CheckCircle2,
  Star,
  Gift,
  Video,
  ShieldCheck,
  Medal,
} from "lucide-react";

// ============================================================
// Static content
// Extracted as arrays instead of repeating near-identical JSX
// blocks. This keeps the page a single file (by design) while
// avoiding manual duplication across 6+ similar cards.
// ============================================================

const PLATFORM_FEATURES = [
  {
    icon: Calendar,
    title: "تعلم منظم",
    description: "خطط دراسية محكمة تناسب نمط حياتك اليومي",
  },
  {
    icon: LineChart,
    title: "متابعة مستمرة",
    description: "تقارير دورية تضمن تطور مستواك التعليمي",
  },
  {
    icon: FileCheck2,
    title: "اختبارات تفاعلية",
    description: "قياس حقيقي لقدراتك مع رصد نقاط القوة والضعف",
  },
  {
    icon: BookOpenCheck,
    title: "واجبات وتطبيقات",
    description: "تدريب مستمر يرسخ المفاهيم والمعلومات في الذهن",
  },
  {
    icon: Target,
    title: "تقييم شامل",
    description: "آراء الخبراء ونصائح تساعدك في تسريع تقدمك",
  },
  {
    icon: Trophy,
    title: "منافسة شريفة",
    description: "لوحة متفوقين تحفز همتك للوصول إلى القمة دائمًا",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    number: "١",
    title: "اختر مرحلتك",
    description: "حدد مستواك الدراسي المناسب",
  },
  {
    number: "٢",
    title: "اختر الشهر",
    description: "اختر الحزمة الشهرية لمناهجك",
  },
  {
    number: "٣",
    title: "ادرس المحتوى",
    description: "شاهد الدروس المسجلة بدقة عالية",
  },
  {
    number: "٤",
    title: "حل الواجبات والاختبارات",
    description: "تطبيق فوري لترسيخ المعرفة",
  },
  {
    number: "٥",
    title: "تابع تقدمك",
    description: "لوحة تحكم ذكية تلخص أداءك",
  },
  {
    number: "٦",
    title: "نافس الطلاب",
    description: "ارتقِ في سلم الترتيب العالمي",
  },
];

const PLATFORM_STATS = [
  {
    icon: Gift,
    value: 4800,
    suffix: "+",
    label: "الواجبات والتطبيقات المحلولة",
  },
  { icon: Video, value: 1200, suffix: "+", label: "الدروس المسجلة والمباشرة" },
  {
    icon: ShieldCheck,
    value: 950,
    suffix: "+",
    label: "الاختبارات الدورية المنجزة",
  },
  { icon: Medal, value: 12500, suffix: "+", label: "طالب متفوق وفعال حاليًا" },
];

const TEACHER_HIGHLIGHTS = [
  "حاصل على الدكتوراه في اللغويات المقارنة والأدب العربي",
  'صاحب منهجية "المحاكاة البلاغية" لتبسيط النحو والصرف',
  "خرّج أكثر من ١٠ آلاف طالب متفوق على مستوى العالم العربي",
];

// ============================================================
// Animation variants (Framer Motion)
// Centralized so every section reuses the same fade/slide feel
// instead of redefining transition values per element.
// ============================================================

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ============================================================
// Small local building block — the "star with lines" divider
// used above every section title. Not exported: this file is
// intentionally kept as a single page, per project decision.
// ============================================================

function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-3 mb-4">
      <span className="w-10 h-px bg-primary-border" />
      <Star size={16} className="text-primary" fill="currentColor" />
      <span className="w-10 h-px bg-primary-border" />
    </div>
  );
}

// ============================================================
// Animated counter — counts up from 0 to `value` once the
// element scrolls into view. Kept local to this file (not a
// separate component export) per the project's decision to
// treat the homepage as a single, mostly-presentational file.
// ============================================================

function AnimatedCounter({
  value,
  suffix = "",
  duration = 1.5,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let animationFrameId: number;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // Ease-out effect: fast at the start, settles gently near the end
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.floor(eased * value));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(value); // ensure it lands exactly on the final number
      }
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, value, duration]);

  return (
    <p ref={ref} className="text-3xl font-bold text-text-main mb-2">
      {displayValue.toLocaleString("ar-EG")}
      {suffix}
    </p>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ============================================================
          SECTION 1 — Hero
          ============================================================ */}
      <section className="min-h-screen flex items-center px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="mx-auto max-w-3xl flex flex-col items-center gap-6 text-center"
        >
          <motion.span
            variants={fadeUp}
            className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-light text-primary"
          >
            <Crown size={28} />
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="font-aref text-6xl sm:text-7xl text-text-main"
          >
            رُقِيّ
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-xl text-primary font-semibold"
          >
            نرتقي باللغة لنرتقي بالعلم
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="text-text-muted leading-relaxed max-w-xl"
          >
            أول منصة تعليمية عربية مخصصة لرعاية الموهبة العلمية وصقل الهوية
            اللغوية، عبر مناهج تفاعلية فريدة ومتابعة أكاديمية متميزة.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center gap-4 mt-2"
          >
            <Link href="/educational-content" className="btn-primary px-8 py-3">
              مشاهدة المحتوى التعليمي
            </Link>
            <Link href="/account" className="btn-outline px-8 py-3">
              ابدأ رحلتك الآن
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================================
          SECTION 2 — Teacher Spotlight
          ============================================================ */}
      <section className="min-h-screen flex items-center px-4 sm:px-6 lg:px-8 py-20 bg-surface">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center border border-[var(--color-border)]">
          {/* Teacher photo */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative w-full aspect-4/5 max-w-sm mx-auto md:mx-0"
          >
            <Image
              src="/images/teacher-image.png"
              alt="الأستاذ سمير محمد أبو المجد"
              fill
              className="object-cover rounded-2xl"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            <span className="absolute top-4 right-4 bg-surface text-text-main text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              معلم الجيل والأكاديمي الأبرز
            </span>
          </motion.div>

          {/* Teacher info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="text-center md:text-right"
          >
            <p className="text-primary text-sm font-semibold mb-2">
              الهيئة الأكاديمية لزُقِيّ
            </p>
            <h2 className="text-3xl font-bold text-text-main mb-3">
              الأستاذ سمير محمد أبو المجد
            </h2>
            <p className="text-text-muted mb-4">
              • معلم اللغة العربية الأساسي بالمنصة
            </p>

            <hr className="border-border w-24 mx-auto md:mx-0 mb-6" />

            <p className="text-text-muted leading-relaxed mb-6">
              خبرة تمتد لأكثر من ربع قرن في توجيه الطلاب نحو القمة اللغوية
              والأكاديمية. ساهم الأستاذ سمير في صياغة مناهج زُقِيّ الحصرية
              وتصميم المنهجيات التعليمية المتميزة التي تنقل الطالب من التأسيس
              البسيط إلى مستويات الإتقان العالية والبلاغة الفصحى.
            </p>

            <ul className="flex flex-col gap-3">
              {TEACHER_HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 justify-center md:justify-start text-sm text-text-main"
                >
                  <CheckCircle2
                    size={18}
                    className="text-primary shrink-0 mt-0.5"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3 — Platform Features
          ============================================================ */}
      <section className="min-h-screen flex items-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-6xl w-full text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <SectionDivider />
            <h2 className="text-3xl font-bold text-text-main mb-3">
              مزايا منصة رُقِيّ التعليمية
            </h2>
            <p className="text-text-muted max-w-xl mx-auto mb-12">
              منظومة متكاملة مبنية بعناية لضمان التفوق الدراسي واستعادة عظمة
              البيان العربي
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {PLATFORM_FEATURES.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="flex flex-col items-center gap-3"
              >
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-light text-primary">
                  <Icon size={22} />
                </span>
                <h3 className="font-bold text-text-main">{title}</h3>
                <p className="text-sm text-text-muted max-w-55">
                  {description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4 — How It Works
          ============================================================ */}
      <section className="min-h-screen flex items-center px-4 sm:px-6 lg:px-8 py-20 bg-surface">
        <div className="mx-auto max-w-6xl w-full text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <SectionDivider />
            <h2 className="text-3xl font-bold text-text-main mb-3">
              كيف تعمل منصة رُقِيّ؟
            </h2>
            <p className="text-text-muted max-w-xl mx-auto mb-12">
              رحلة تعليمية تفاعلية بلمسات تقنية حديثة تبدأ فورًا وتسير بانتظام
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {HOW_IT_WORKS_STEPS.map((step) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                className="ruqi-card p-6 text-center flex flex-col items-center gap-2"
              >
                <span className="text-primary font-bold text-2xl">
                  {step.number}
                </span>
                <h3 className="font-bold text-text-main">{step.title}</h3>
                <p className="text-sm text-text-muted">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 5 — Platform Stats
          ============================================================ */}
      <section className="min-h-screen flex items-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-6xl w-full text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            <SectionDivider />
            <h2 className="text-3xl font-bold text-text-main mb-3">
              أرقام وإنجازات نفخر بها
            </h2>
            <p className="text-text-muted max-w-xl mx-auto mb-12">
              جهود حقيقية لتنمية المجتمع التعليمي وصناعة غد لغوي مشرق
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {PLATFORM_STATS.map(({ icon: Icon, value, suffix, label }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="ruqi-card p-6"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-light text-primary mx-auto mb-3">
                  <Icon size={18} />
                </span>
                <AnimatedCounter value={value} suffix={suffix} />
                <p className="text-sm text-text-muted">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
