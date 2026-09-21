"use client";

// Leaderboard page: stage tabs (all platform / per stage), a top-3 podium plus
// the remaining ranks table. On mobile the podium ranks 2 & 3 sit side by side
// under the full-width rank-1 card; on md+ it becomes the classic 3-column
// podium with the leader centered. Avatars are resolved with a fallback, and the
// current student's own row is highlighted (a synthetic row is appended when the
// leaderboard API does not include them).
import { useState, useEffect, useRef } from "react";
import { getLeaderboard, getLeaderboardStages, getMyLeaderboardSummary } from "@/lib/leaderboard";
import { resolveAvatarSrc, AVATAR_FALLBACK_NAME } from "@/lib/avatar";
import type { LeaderboardStage, MyLeaderboardSummary } from "@/lib/leaderboard";
import type { StudentRank } from "@/lib/types/leaderboard";

const ALL_STAGES_TAB = "على مستوى المنصة";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<string>(ALL_STAGES_TAB);
  const [stages, setStages] = useState<LeaderboardStage[]>([]);
  const [students, setStudents] = useState<StudentRank[]>([]);
  const [mySummary, setMySummary] = useState<MyLeaderboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Memoize the current-user summary per tab so switching tabs doesn't refetch.
  const summaryCache = useRef<Record<string, MyLeaderboardSummary | null>>({});

  const tabs = [ALL_STAGES_TAB, ...stages.map((s) => s.title)];

  useEffect(() => {
    getLeaderboardStages()
      .then(setStages)
      .catch(() => setStages([]));
  }, []);

  // Fetch the current user's own summary for the active tab (cached per tab).
  useEffect(() => {
    let active = true;

    const stage = stages.find((s) => s.title === activeTab);
    const key = stage?._id ?? ALL_STAGES_TAB;
    if (key in summaryCache.current) {
      setMySummary(summaryCache.current[key]);
      return;
    }

    getMyLeaderboardSummary(stage?._id)
      .then((summary) => {
        if (!active) return;
        summaryCache.current[key] = summary;
        setMySummary(summary);
      })
      .catch(() => {
        if (active) setMySummary(null);
      });

    return () => {
      active = false;
    };
  }, [activeTab, stages]);

  // Fetch the ranked students list for the active tab whenever it changes.
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const stage = stages.find((s) => s.title === activeTab);
        const list = await getLeaderboard(stage?._id);
        setStudents(list);
      } catch {
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeTab, stages]);

  // Tag the rows owned by the current user, then make sure the user always
  // appears - appending a synthetic row (points + computed rank) when missing.
  const baseRows = students.map((s) => ({
    ...s,
    isCurrentUser: Boolean(mySummary && String(s.id) === mySummary.studentId),
  }));

  const rows =
    mySummary && !baseRows.some((r) => r.isCurrentUser)
      ? [
          ...baseRows,
          {
            id: `current-user-${mySummary.studentId}`,
            name: mySummary.name || "أنت",
            stage: activeTab === ALL_STAGES_TAB ? "" : activeTab,
            points: mySummary.points,
            rank: baseRows.filter((r) => r.points >= mySummary.points).length + 1,
            imageUrl: "",
            isCurrentUser: true,
          } satisfies StudentRank,
        ]
      : baseRows;

  // Split into the podium (ranks 1-3) and the regular rank table (everything else).
  const topThree = rows.filter((s) => s.rank <= 3).sort((a, b) => a.rank - b.rank);
  const otherRanks = rows.filter((s) => s.rank > 3).sort((a, b) => a.rank - b.rank);

  // Medal-style badge colors for the top-3 positions (gold / silver / bronze).
  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-[#E6C15C]";
    if (rank === 2) return "bg-[#B8C2C7]";
    if (rank === 3) return "bg-[#CFA085]";
    return "bg-primary-light";
  };

  // Arabic ordinal labels up to "العاشر", falling back to the raw number.
  const rankName = (rank: number): string | number => {
    const names: Record<number, string> = {
      4: "الرابع",
      5: "الخامس",
      6: "السادس",
      7: "السابع",
      8: "الثامن",
      9: "التاسع",
      10: "العاشر",
    };
    return names[rank] ?? rank;
  };

  return (
    <div
      dir="rtl"
      className="w-full min-h-screen bg-background flex flex-col items-center overflow-hidden py-20 px-4 md:px-8"
    >
      <main className="flex flex-col items-center px-4 md:px-8 gap-10 md:gap-14 w-full max-w-7xl">
        <div className="flex flex-col items-center gap-4 w-full text-center">
          <div className="flex flex-row items-center gap-3">
            <div className="w-7.5 md:w-10 h-[1.5px] bg-primary"></div>
            <div className="w-3.5 md:w-4.5 h-3.5 md:h-4.5 border-2 border-primary rotate-45"></div>
            <div className="w-7.5 md:w-10 h-[1.5px] bg-primary"></div>
          </div>
          <h1 className="font-extrabold text-[28px] md:text-[36px] text-text-main leading-snug md:leading-16.75">
            المتفوقون في رُقِيّ
          </h1>
          <p className="font-medium text-[14px] md:text-[16px] text-text-muted leading-relaxed md:leading-6.5">
            لوحة الشرف لتكريم الطلاب الأكثر تميزاً وجدية في إنهاء المهام الدراسية
          </p>
        </div>

        <div className="flex flex-row flex-wrap justify-center items-center gap-3 w-full">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-6 py-2 rounded-xl border text-[13px] md:text-[14px] font-bold transition-all duration-200 ${
                activeTab === tab
                  ? "bg-primary border-primary text-[#1E1A17]"
                  : "bg-surface border-border text-text-muted hover:border-primary hover:text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center w-full py-24">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : rows.length > 0 ? (
          <div className="flex flex-col w-full gap-14 items-center">
            {topThree.length > 0 && (
              // Podium grid: on mobile the rank-1 card spans the full first row (col-span-2)
              // while ranks 2 & 3 share the row below; on md+ it becomes the classic 3-column
              // podium with the leader centered (order-2), flanked by ranks 2 (order-1) and 3 (order-3).
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 w-full justify-items-center items-stretch md:items-end">
                {topThree.find((s) => s.rank === 2) && (
                  <div className="flex flex-col items-center justify-center p-6 gap-4 rounded-[20px] col-span-1 order-2 md:order-1 w-full max-w-[300px] bg-surface border border-border shadow-lg hover:-translate-y-1 transition-transform duration-300">
                    <div className="relative w-18 h-18 rounded-full bg-background">
                      <img
                        src={resolveAvatarSrc(topThree.find((s) => s.rank === 2)?.imageUrl, topThree.find((s) => s.rank === 2)?.name ?? AVATAR_FALLBACK_NAME).src}
                        alt={topThree.find((s) => s.rank === 2)?.name ?? ""}
                        className="w-full h-full rounded-full object-cover"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex justify-center items-center ${getRankBadgeColor(2)} text-white font-extrabold text-[12px]`}
                      >
                        ٢
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[13px] md:text-[16px] font-bold text-text-main text-center leading-snug break-words line-clamp-2 w-full">
                        {topThree.find((s) => s.rank === 2)?.name}
                      </span>
                      <span className="font-normal text-[12px] text-text-muted">
                        {topThree.find((s) => s.rank === 2)?.stage}
                      </span>
                    </div>
                    <div className="px-3 py-1 bg-primary-light rounded-md">
                      <span className="font-bold text-[13px] text-primary">المركز الثاني</span>
                    </div>
                    <span className="font-extrabold text-[18px] text-text-main">
                      {topThree.find((s) => s.rank === 2)?.points} نقطة
                    </span>
                  </div>
                )}

                {topThree.find((s) => s.rank === 1) && (
                  <div className="flex flex-col items-center p-8 gap-5 col-span-2 order-1 md:col-span-1 md:order-2 w-full max-w-[320px] bg-[#1E1A17] shadow-[0_12px_32px_-4px_rgba(212,175,55,0.1)] rounded-3xl z-10 hover:-translate-y-2 transition-transform duration-300">
                    <div className="relative w-24 h-24 rounded-full bg-background border-2 border-primary">
                      <img
                        src={resolveAvatarSrc(topThree.find((s) => s.rank === 1)?.imageUrl, topThree.find((s) => s.rank === 1)?.name ?? AVATAR_FALLBACK_NAME).src}
                        alt={topThree.find((s) => s.rank === 1)?.name ?? ""}
                        className="w-full h-full rounded-full object-cover"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex justify-center items-center ${getRankBadgeColor(1)}`}
                      >
                        <svg className="w-4 h-4 text-[#1E1A17]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 003.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM7 10.82C5.84 10.4 5 9.3 5 8V7h2v3.82zM19 8c0 1.3-.84 2.4-2 2.82V7h2v1z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-[16px] md:text-[20px] font-extrabold text-white text-center leading-snug break-words line-clamp-2 w-full">
                        {topThree.find((s) => s.rank === 1)?.name}
                      </span>
                      <span className="font-normal text-[13px] text-[#FAF3E6] opacity-80">
                        {topThree.find((s) => s.rank === 1)?.stage}
                      </span>
                    </div>
                    <div className="px-4 py-1.5 bg-primary rounded-lg">
                      <span className="font-extrabold text-[12px] text-[#1E1A17]">المركز الأول</span>
                    </div>
                    <span className="font-black text-[22px] text-primary">
                      {topThree.find((s) => s.rank === 1)?.points} نقطة
                    </span>
                  </div>
                )}

                {topThree.find((s) => s.rank === 3) && (
                  <div className="flex flex-col items-center justify-center p-6 gap-4 rounded-[20px] col-span-1 order-3 w-full max-w-[300px] bg-surface border border-border shadow-lg hover:-translate-y-1 transition-transform duration-300">
                    <div className="relative w-18 h-18 rounded-full bg-background">
                      <img
                        src={resolveAvatarSrc(topThree.find((s) => s.rank === 3)?.imageUrl, topThree.find((s) => s.rank === 3)?.name ?? AVATAR_FALLBACK_NAME).src}
                        alt={topThree.find((s) => s.rank === 3)?.name ?? ""}
                        className="w-full h-full rounded-full object-cover"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex justify-center items-center ${getRankBadgeColor(3)} text-white font-extrabold text-[12px]`}
                      >
                        ٣
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[13px] md:text-[16px] font-bold text-text-main text-center leading-snug break-words line-clamp-2 w-full">
                        {topThree.find((s) => s.rank === 3)?.name}
                      </span>
                      <span className="font-normal text-[12px] text-text-muted">
                        {topThree.find((s) => s.rank === 3)?.stage}
                      </span>
                    </div>
                    <div className="px-3 py-1 bg-primary-light rounded-md">
                      <span className="font-bold text-[13px] text-primary">المركز الثالث</span>
                    </div>
                    <span className="font-extrabold text-[18px] text-text-main">
                      {topThree.find((s) => s.rank === 3)?.points} نقطة
                    </span>
                  </div>
                )}
              </div>
            )}

            {otherRanks.length > 0 && (
              <>
                {/* Desktop table + mobile cards for everyone below the podium. */}
                <div className="hidden md:block w-full rounded-[20px] border border-border shadow-sm bg-surface overflow-hidden">
                  <table className="w-full table-fixed text-center border-collapse">
                    <thead className="bg-primary-light">
                      <tr>
                        <th className="py-5 px-4 font-bold text-[14px] text-text-main w-[12%]">المركز</th>
                        <th className="py-5 px-4 font-bold text-[14px] text-text-main w-[38%]">اسم الطالب</th>
                        <th className="py-5 px-4 font-bold text-[14px] text-text-main w-[25%]">المرحلة الدراسية</th>
                        <th className="py-5 px-4 font-bold text-[14px] text-text-main w-[25%]">مجموع النقاط</th>
                      </tr>
                    </thead>
                    <tbody>
                      {otherRanks.map((student) => (
                        <tr
                          key={student.id}
                          className={`border-t border-border transition-colors ${
                            student.isCurrentUser
                              ? "bg-primary"
                              : "bg-surface hover:bg-gray-50"
                          }`}
                        >
                          <td
                            className={`py-5 px-4 font-bold text-[15px] ${
                              student.isCurrentUser ? "text-[#1E1A17]" : "text-primary"
                            }`}
                          >
                            المركز {rankName(student.rank)}
                          </td>
                          <td className="py-5 px-4">
                            <div className="flex items-center justify-center gap-3">
                              {/* resolveAvatarSrc falls back to a generated avatar when a student has none. */}
                              <img
                                src={resolveAvatarSrc(student.imageUrl, student.name).src}
                                alt={student.name}
                                className="w-10 h-10 rounded-full object-cover shrink-0 bg-primary-light"
                              />
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className={`font-bold text-[15px] ${
                                    student.isCurrentUser ? "text-[#1E1A17]" : "text-text-main"
                                  }`}
                                >
                                  {student.name}
                                </span>
                                {student.isCurrentUser && (
                                  <span className="px-2 py-0.5 bg-[#1E1A17] text-primary text-[11px] font-extrabold rounded-full">
                                    أنت
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td
                            className={`py-5 px-4 font-medium text-[14px] ${
                              student.isCurrentUser ? "text-[#1E1A17]/75" : "text-text-muted"
                            }`}
                          >
                            {student.stage}
                          </td>
                          <td
                            className={`py-5 px-4 font-extrabold text-[15px] ${
                              student.isCurrentUser ? "text-[#1E1A17]" : "text-text-main"
                            }`}
                          >
                            {student.points} نقطة
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden flex flex-col gap-3 w-full">
                  {otherRanks.map((student) => (
                    <div
                      key={student.id}
                      className={`flex items-center gap-3 p-4 rounded-[18px] border shadow-sm transition-colors ${
                        student.isCurrentUser
                          ? "bg-primary border-primary/60 ring-2 ring-primary/25"
                          : "bg-surface border-border"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center shrink-0 w-10 h-10 rounded-full font-extrabold text-[14px] ${
                          student.isCurrentUser
                            ? "bg-[#1E1A17] text-primary"
                            : `${getRankBadgeColor(student.rank)} ${
                                student.rank <= 3 ? "text-white" : "text-primary"
                              }`
                        }`}
                      >
                        {student.rank}
                      </div>
                      <img
                        src={resolveAvatarSrc(student.imageUrl, student.name).src}
                        alt={student.name}
                        className="w-14 h-14 rounded-full object-cover shrink-0 bg-primary-light"
                      />
                      <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`font-bold text-[15px] leading-tight truncate ${
                              student.isCurrentUser ? "text-[#1E1A17]" : "text-text-main"
                            }`}
                          >
                            {student.name}
                          </span>
                          {student.isCurrentUser && (
                            <span className="px-2 py-0.5 bg-[#1E1A17] text-primary text-[10px] font-extrabold rounded-full shrink-0">
                              أنت
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[12px] truncate ${
                            student.isCurrentUser ? "text-[#1E1A17]/70" : "text-text-muted"
                          }`}
                        >
                          {student.stage}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span
                          className={`font-black text-[18px] leading-none ${
                            student.isCurrentUser ? "text-[#1E1A17]" : "text-primary"
                          }`}
                        >
                          {student.points}
                        </span>
                        <span
                          className={`text-[11px] ${
                            student.isCurrentUser ? "text-[#1E1A17]/70" : "text-text-muted"
                          }`}
                        >
                          نقطة
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-20 md:py-32 px-5 bg-surface border border-border rounded-card text-center">
            <svg
              className="w-20 h-20 md:w-24 md:h-24 text-primary opacity-40 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <h3 className="font-extrabold text-[20px] md:text-[24px] text-text-main mb-3">
              لم يتم تسجيل أي نقاط أو مراكز في لوحة الشرف حتى الآن،
              <br />
              بادر بالتفوق وكن أول المنضمين!
            </h3>
          </div>
        )}
      </main>
    </div>
  );
}