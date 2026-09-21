"use client";

import { useEffect, useState } from "react";
import {
  Star,
  Trophy,
  Sparkles,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { getMonthProgress } from "@/lib/student/dashboard";
import { getEducationalStages } from "@/lib/educational-content/stages";
import { getMonthsByStage } from "@/lib/educational-content/months";
import { getOverallTopStudents } from "@/lib/leaderboard";
import type { StudentMonthProgress } from "@/lib/student/dashboard";
import type { UserProfile } from "@/lib/types/account";
import type { Month } from "@/lib/types/educational-content";

const fmt = (n: number) => n.toLocaleString("ar-EG");

interface Totals {
  totalLessons: number;
  completedLessons: number;
  totalExams: number;
  completedExams: number;
  totalPoints: number;
  lessonPoints: number;
  examPoints: number;
  lessonsStarted: number;
  homeworksDone: number;
  homeworksStarted: number;
  examsStarted: number;
  monthsDone: number;
  monthsTotal: number;
}

interface RankInfo {
  rank: number;
  enoughPoints: number | null;
}

const EMPTY_TOTALS: Totals = {
  totalLessons: 0,
  completedLessons: 0,
  totalExams: 0,
  completedExams: 0,
  totalPoints: 0,
  lessonPoints: 0,
  examPoints: 0,
  lessonsStarted: 0,
  homeworksDone: 0,
  homeworksStarted: 0,
  examsStarted: 0,
  monthsDone: 0,
  monthsTotal: 0,
};

export default function StudentExtraSections({
  profile,
}: {
  profile: UserProfile;
}) {
  const [progress, setProgress] = useState<Totals | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [rank, setRank] = useState<RankInfo | null>(null);
  const [rankLoading, setRankLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      try {
        const monthIds = await (async () => {
          if (profile.stage) {
            const months = await getMonthsByStage(profile.stage).catch(
              () => [] as Month[],
            );
            return months.map((month) => month._id);
          }
          const stages = await getEducationalStages();
          const monthLists = await Promise.all(
            stages.map((stage) =>
              getMonthsByStage(stage._id).catch(() => [] as Month[]),
            ),
          );
          return monthLists.flat().map((month) => month._id);
        })();
        if (!active) return;

        const months = await Promise.all(
          monthIds.map((id) => getMonthProgress(id).catch(() => null)),
        );
        if (!active) return;

        const valid = months.filter(
          (m): m is StudentMonthProgress => m !== null,
        );

        const totals: Totals = {
          totalLessons: 0,
          completedLessons: 0,
          totalExams: 0,
          completedExams: 0,
          totalPoints: 0,
          lessonPoints: 0,
          examPoints: 0,
          lessonsStarted: 0,
          homeworksDone: 0,
          homeworksStarted: 0,
          examsStarted: 0,
          monthsDone: 0,
          monthsTotal: monthIds.length,
        };

        for (const m of valid) {
          totals.totalLessons += m.summary.totalLessons;
          totals.completedLessons += m.summary.completedLessons;
          totals.totalExams += m.summary.totalExams;
          totals.completedExams += m.summary.completedExams;
          totals.totalPoints += m.summary.totalPoints;
          totals.lessonPoints += m.summary.lessonPoints;
          totals.examPoints += m.summary.examPoints;

          for (const l of m.lessons) {
            if (
              !l.completed &&
              (l.videoCompleted ||
                l.explanationCompleted ||
                l.homeworkCompleted ||
                l.bookCompleted)
            ) {
              totals.lessonsStarted++;
            }
            if (l.homeworkCompleted) totals.homeworksDone++;
            else if (
              l.videoCompleted ||
              l.explanationCompleted ||
              l.bookCompleted
            )
              totals.homeworksStarted++;
          }
          for (const e of m.exams) {
            if (!e.passed && e.points > 0) totals.examsStarted++;
          }

          const hasItems = m.summary.totalLessons + m.summary.totalExams > 0;
          const allLessonsDone =
            m.summary.totalLessons === 0 ||
            m.summary.completedLessons === m.summary.totalLessons;
          const allExamsDone =
            m.summary.totalExams === 0 ||
            m.summary.completedExams === m.summary.totalExams;
          if (hasItems && allLessonsDone && allExamsDone) totals.monthsDone++;
        }

        if (active) setProgress(totals);
      } catch {
        if (active) setProgress(null);
      } finally {
        if (active) setProgressLoading(false);
      }
    }

    loadProgress();

    getOverallTopStudents()
      .then((list) => {
        if (!active) return;
        const mine = list.find(
          (s) =>
            String(s.id) === String(profile.studentId) ||
            s.name === profile.name,
        );
        if (mine) {
          const top = list[0];
          setRank({
            rank: mine.rank,
            enoughPoints: top
              ? Math.max(0, top.points - mine.points + 1)
              : null,
          });
        } else {
          setRank(null);
        }
      })
      .catch(() => {
        if (!active) return;
        setRank(null);
      })
      .finally(() => {
        if (active) setRankLoading(false);
      });

    return () => {
      active = false;
    };
  }, [profile]);

  const t = progress ?? EMPTY_TOTALS;

  const contentTotal = t.totalLessons + t.totalExams;
  const overallPct =
    contentTotal > 0
      ? Math.round(
          (100 * (t.completedLessons + t.completedExams)) / contentTotal,
        )
      : 0;
  const lessonsNotStarted =
    t.totalLessons - t.completedLessons - t.lessonsStarted;
  const homeworksNotStarted =
    t.totalLessons - t.homeworksDone - t.homeworksStarted;
  const examsNotStarted = t.totalExams - t.completedExams - t.examsStarted;
  const monthsPct =
    t.monthsTotal > 0 ? Math.round((100 * t.monthsDone) / t.monthsTotal) : 0;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - overallPct / 100);

  return (
    <div className="w-full max-w-300 flex flex-col gap-12" dir="rtl">
      {progressLoading ? (
        <div className="bg-white border border-[#E9E3D8] rounded-3xl p-10 h-64 animate-pulse" />
      ) : (
        <section className="bg-surface border border-[#E9E3D8] rounded-3xl p-6 md:p-10 shadow-[0px_8px_24px_-2px_rgba(84,70,58,0.06)] flex flex-col gap-10">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex flex-row items-center gap-3">
              <div className="w-10 h-[1.5px] bg-[#D4AF37]" />
              <Star size={18} className="text-[#D4AF37]" fill="#D4AF37" />
              <div className="w-10 h-[1.5px] bg-[#D4AF37]" />
            </div>
            <h2 className="font-extrabold text-[24px] md:text-[28px] text-[#2C2621]">
              مسار التقدم الأكاديمي
            </h2>
            <p className="text-[14px] text-[#6E655F]">
              رصد حي لمستويات التحصيل والمشاهدة وحل الواجبات الشهرية
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-85 bg-[#FAF8F5] rounded-[16px] p-6 flex flex-col items-center justify-center gap-6 shrink-0">
              <div className="relative w-25 h-25 sm:w-27.5 sm:h-27.5 lg:w-32.5 lg:h-32.5 flex items-center justify-center">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 130 130"
                >
                  <circle
                    cx="65"
                    cy="65"
                    r="56"
                    fill="none"
                    stroke="#FAF3E6"
                    strokeWidth="12"
                  />
                  <circle
                    cx="65"
                    cy="65"
                    r="56"
                    fill="none"
                    stroke="#D4AF37"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference.toFixed(1)}
                    strokeDashoffset={dashOffset.toFixed(1)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-extrabold text-[16px] sm:text-[18px] lg:text-[22px] text-[#2C2621] mt-1">
                    {fmt(overallPct)}%
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-2">
                <h3 className="font-bold text-[14px] text-[#2C2621]">
                  إنجاز المناهج العام
                </h3>
                <p className="text-[13px] text-[#6E655F]">
                  {contentTotal > 0
                    ? `أكملت ${fmt(t.completedLessons + t.completedExams)} من أصل ${fmt(contentTotal)} درساً واختباراً`
                    : "لا توجد شهور مشتركة بعد"}
                </p>
                <span className="text-[#22C55E] font-bold text-[12px]">
                  إجمالي نقاط التقدم: {fmt(t.totalPoints)} نقطة
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-8">
              <div className="bg-[#FAF8F5] rounded-[16px] p-6 flex flex-col gap-4 justify-center h-23">
                <div className="flex flex-row justify-between items-center w-full">
                  <span className="font-bold text-[14px] text-[#2C2621]">
                    الشهور المنجزة
                  </span>
                  <span className="text-[#6E655F] text-[13px]">
                    تم إنجاز {fmt(t.monthsDone)} من أصل {fmt(t.monthsTotal)} شهر
                  </span>
                </div>
                <div
                  className="w-full bg-[#FAF3E6] h-2.5 rounded-full overflow-hidden"
                  dir="ltr"
                >
                  <div
                    className="bg-[#D4AF37] h-full rounded-full transition-all duration-500"
                    style={{ width: `${monthsPct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border border-[#E9E3D8] rounded-[16px] p-5 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-[16px] text-[#2C2621]">
                      الاختبارات الدورية
                    </h4>
                    <span className="text-[18px] text-[#997D21] font-extrabold">
                      {fmt(t.totalExams)}
                    </span>
                  </div>
                  <hr className="border-[#E9E3D8]" />
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#6E655F]">منجزة:</span>
                      <span className="text-[12px] font-bold text-[#22C55E]">
                        {fmt(t.completedExams)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#6E655F]">
                        مستمرة:
                      </span>
                      <span className="text-[12px] font-bold text-[#997D21]">
                        {fmt(t.examsStarted)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#6E655F]">
                        غير مبدأة:
                      </span>
                      <span className="text-[12px] font-bold text-[#6E655F]">
                        {fmt(examsNotStarted)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#E9E3D8] rounded-[16px] p-5 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-[16px] text-[#2C2621]">
                      الواجبات والتطبيقات
                    </h4>
                    <span className="text-[18px] text-[#997D21] font-extrabold">
                      {fmt(t.totalLessons)}
                    </span>
                  </div>
                  <hr className="border-[#E9E3D8]" />
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#6E655F]">منجزة:</span>
                      <span className="text-[12px] font-bold text-[#22C55E]">
                        {fmt(t.homeworksDone)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#6E655F]">
                        مستمرة:
                      </span>
                      <span className="text-[12px] font-bold text-[#997D21]">
                        {fmt(t.homeworksStarted)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#6E655F]">
                        غير مبدأة:
                      </span>
                      <span className="text-[12px] font-bold text-[#6E655F]">
                        {fmt(homeworksNotStarted)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#E9E3D8] rounded-[16px] p-5 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-[16px] text-[#2C2621]">
                      الدروس والفيديوهات
                    </h4>
                    <span className="text-[18px] text-[#997D21] font-extrabold">
                      {fmt(t.totalLessons)}
                    </span>
                  </div>
                  <hr className="border-[#E9E3D8]" />
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#6E655F]">منجزة:</span>
                      <span className="text-[12px] font-bold text-[#22C55E]">
                        {fmt(t.completedLessons)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#6E655F]">
                        مستمرة:
                      </span>
                      <span className="text-[12px] font-bold text-[#997D21]">
                        {fmt(t.lessonsStarted)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[#6E655F]">
                        غير مبدأة:
                      </span>
                      <span className="text-[12px] font-bold text-[#6E655F]">
                        {fmt(lessonsNotStarted)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {rankLoading ? (
        <div className="bg-white border border-[#E9E3D8] rounded-3xl p-10 h-64 animate-pulse" />
      ) : (
        <section className="bg-white border border-[#E9E3D8] rounded-3xl p-6 md:p-10 shadow-[0px_8px_24px_-2px_rgba(84,70,58,0.06)] flex flex-col gap-8 mb-8">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex flex-row items-center gap-3">
              <div className="w-10 h-[1.5px] bg-[#D4AF37]" />
              <Trophy size={18} className="text-[#D4AF37]" />
              <div className="w-10 h-[1.5px] bg-[#D4AF37]" />
            </div>
            <h2 className="font-extrabold text-[24px] md:text-[28px] text-[#2C2621]">
              المنافسة ولوحة الصدارة الدراسية
            </h2>
            <p className="text-[14px] text-[#6E655F]">
              موقعك الحالي بين فرسان الضاد وأبطال الأسبوع
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-[#FAF8F5] rounded-[16px] p-6 flex flex-col items-center justify-center flex-1 gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF3E6] border-2 border-[#997D21] flex items-center justify-center">
                <Sparkles size={22} className="text-[#997D21]" />
              </div>
              <span className="text-[#6E655F] text-[14px]">مجموع نقاطك</span>
              <span className="font-black text-[24px] text-[#2C2621]">
                {fmt(t.totalPoints)} نقطة
              </span>
            </div>

            <div className="bg-[#FAF8F5] rounded-[16px] p-6 flex flex-col items-center justify-center flex-1 gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF3E6] border-2 border-[#997D21] flex items-center justify-center">
                <Trophy size={22} className="text-[#997D21]" />
              </div>
              <span className="text-[#6E655F] text-[14px]">الترتيب العام</span>
              <span className="font-black text-[24px] text-[#997D21]">
                {rank ? `المركز ${fmt(rank.rank)}` : "—"}
              </span>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white border border-[#E9E3D8] rounded-3xl p-6 md:p-10 shadow-[0px_8px_24px_-2px_rgba(84,70,58,0.06)] flex flex-col gap-4 mb-8">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex flex-row items-center gap-3">
            <div className="w-10 h-[1.5px] bg-[#D4AF37]" />
            <MessageCircle size={18} className="text-[#D4AF37]" />
            <div className="w-10 h-[1.5px] bg-[#D4AF37]" />
          </div>
          <h2 className="font-extrabold text-[24px] md:text-[28px] text-[#2C2621]">
            الاشتراك والدعم الفني
          </h2>
          <p className="text-[14px] text-[#6E655F]">
            كل ما يخص تفعيل اشتراكك والتواصل معنا لحل أي مشكلة
          </p>
        </div>

        <details className="group bg-[#FAF8F5] border border-[#E9E3D8] rounded-[16px] px-5 py-4">
          <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-bold text-[15px] text-[#2C2621] select-none">
            ازاي تشترك معانا في شهر معين ؟
            <ChevronDown
              size={18}
              className="text-[#997D21] shrink-0 transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <ol className="mt-4 flex flex-col gap-2 text-[14px] leading-relaxed text-[#6E655F] list-decimal list-inside pr-2">
            <li>
              ادخل على رقم الأدمن على واتساب{" "}
              <a
                href="https://wa.me/201012345678"
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="font-bold text-[#997D21]"
              >
                01012345678
              </a>
            </li>
            <li>
              ابعت بياناتك (اسمك، الـ ID بتاعك، الشهر اللي انت عاوز تفعله)
            </li>
            <li>ابعت اسكرين لريسيت الدفع</li>
            <li>
              الأدمن هيتواصل معاك وهيتأكد من سلامة البيانات ويفتح ليك المحتوى
              التعليمي الخاص بالشهر المطلوب ويبلغك
            </li>
            <li>
              بعد كدا تذاكر وتجتهد يا بطل وتبقى من أبطالنا وطلابنا المميزين
            </li>
          </ol>
        </details>

        <details className="group bg-[#FAF8F5] border border-[#E9E3D8] rounded-[16px] px-5 py-4">
          <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-bold text-[15px] text-[#2C2621] select-none">
            ازاي تتواصل مع الدعم الفني لو واجهك أي مشاكل في المنصة ؟
            <ChevronDown
              size={18}
              className="text-[#997D21] shrink-0 transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <ol className="mt-4 flex flex-col gap-2 text-[14px] leading-relaxed text-[#6E655F] list-decimal list-inside pr-2">
            <li>
              ادخل على رقم الأدمن على واتساب{" "}
              <a
                href="https://wa.me/201012345678"
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="font-bold text-[#997D21]"
              >
                01012345678
              </a>
            </li>
            <li>ابعت بياناتك (اسمك، الـ ID بتاعك، المشكلة اللي بتواجهك)</li>
            <li>الأدمن هيتواصل معاك دايركت وهنحاول نحل مشكلتك في أسرع وقت</li>
          </ol>
        </details>
      </section>
    </div>
  );
}
