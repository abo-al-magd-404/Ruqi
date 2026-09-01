"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Trophy, Info, Settings, KeyRound, User, LogOut } from "lucide-react";
import { getProfile, logoutUser, updateStudentProfile, UserProfile } from "@/lib/api";

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center mb-6 md:mb-10 text-center px-4">
      <svg
        className="w-full max-w-[420px] h-[14px] md:h-[18px] mb-4"
        viewBox="0 0 504 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="171" y="8.5" width="60" height="1" fill="#D4AF37" />
        <path
          d="M251.792 1.55918C251.729 1.59826 251.678 1.65416 251.645 1.72056L249.913 5.22981C249.799 5.46101 249.63 5.661 249.422 5.81255C249.213 5.9641 248.971 6.06268 248.716 6.09981L244.842 6.66606C244.768 6.67648 244.699 6.7074 244.642 6.7553C244.585 6.80319 244.542 6.86613 244.519 6.93695C244.496 7.00777 244.494 7.08362 244.512 7.15587C244.53 7.22811 244.568 7.29383 244.621 7.34556L247.423 10.0733C247.608 10.2534 247.747 10.4758 247.827 10.7213C247.906 10.9669 247.925 11.2281 247.882 11.4826L247.221 15.3368C247.208 15.4101 247.216 15.4855 247.244 15.5545C247.272 15.6235 247.318 15.6832 247.379 15.727C247.439 15.7707 247.51 15.7967 247.584 15.802C247.658 15.8073 247.733 15.7916 247.798 15.7568L251.261 13.9358C251.489 13.816 251.743 13.7534 252.001 13.7534C252.259 13.7534 252.513 13.816 252.741 13.9358L256.204 15.7568C256.27 15.7918 256.344 15.8077 256.419 15.8025C256.493 15.7973 256.564 15.7713 256.625 15.7276C256.685 15.6838 256.732 15.6239 256.76 15.5548C256.788 15.4857 256.796 15.4102 256.783 15.3368L256.121 11.4818C256.078 11.2275 256.097 10.9664 256.176 10.721C256.256 10.4757 256.395 10.2534 256.579 10.0733L259.381 7.34481C259.434 7.29302 259.472 7.22741 259.49 7.15539C259.508 7.08336 259.505 7.00781 259.482 6.93726C259.459 6.86672 259.417 6.804 259.36 6.75621C259.303 6.70841 259.234 6.67745 259.161 6.66681L255.286 6.09981C255.031 6.06239 254.789 5.96368 254.581 5.81215C254.373 5.66062 254.204 5.46079 254.09 5.22981L252.358 1.72056C252.325 1.65416 252.274 1.59826 252.211 1.55918C252.148 1.5201 252.075 1.49939 252.001 1.49939C251.927 1.49939 251.855 1.5201 251.792 1.55918Z"
          stroke="#D4AF37"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="273" y="8.5" width="60" height="1" fill="#D4AF37" />
      </svg>
      <h2 className="text-[20px] md:text-[28px] font-extrabold text-[#2C2621] mb-2">{title}</h2>
      <p className="text-[13px] md:text-[14px] font-medium text-[#6E655F] leading-relaxed">{subtitle}</p>
    </div>
  );
}

export default function StudentProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    educationalStage: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    progressPercent: 0,
    progressWeekly: 0,
    monthsCompleted: 0,
    monthsTotal: 0,
    exams: { completed: 0, ongoing: 0, notStarted: 0, total: 0 },
    homeworks: { completed: 0, ongoing: 0, notStarted: 0, total: 0 },
    points: 0,
    rank: 0,
    pointsToNextRank: 0
  });

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutUser();
    router.replace("/account");
    router.refresh();
  };

  const openEditModal = () => {
    setEditForm({
      name: profile?.name ?? "",
      phoneNumber: profile?.phoneNumber ?? "",
      address: profile?.address ?? "",
      educationalStage: profile?.educationalStage ?? "",
    });
    setEditError(null);
    setShowEditModal(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: field, value } = e.target;
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (editError) setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    setEditError(null);

    try {
      const updated = await updateStudentProfile({
        name: editForm.name,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address,
        educationalStage: editForm.educationalStage,
      });
      setProfile(updated);
      setShowEditModal(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "تعذر حفظ البيانات");
    } finally {
      setSavingEdit(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: field, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    if (passwordError) setPasswordError(null);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordError("كلمتا المرور غير متطابقتين");
      return;
    }
    if (passwordForm.password.length < 6) {
      setPasswordError("كلمة المرور يجب ألا تقل عن 6 أحرف");
      return;
    }

    setSavingPassword(true);
    setPasswordError(null);

    try {
      const updated = await updateStudentProfile({ password: passwordForm.password });
      setProfile(updated);
      setPasswordForm({ password: "", confirmPassword: "" });
      setShowPasswordModal(false);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "تعذر تغيير كلمة المرور");
    } finally {
      setSavingPassword(false);
    }
  };

  useEffect(() => {
    let active = true;

    getProfile()
      .then((data) => {
        if (!active) return;
        setProfile(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "تعذر تحميل بيانات الحساب");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-cairo">
        <span className="text-[#6E655F] font-medium text-[15px]">جاري تحميل بيانات الحساب...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4 font-cairo text-center" dir="rtl">
        <span className="text-[#D32F2F] font-bold text-[16px] max-w-[300px] leading-relaxed">
          {error ?? "تعذر تحميل بيانات الحساب"}
        </span>
        <button
          type="button"
          onClick={() => router.push("/account/login")}
          className="h-[48px] px-8 bg-[#D4AF37] rounded-xl text-[#1E1A17] font-bold text-[15px] hover:bg-[#c29f32] transition-colors shadow-sm"
        >
          تسجيل الدخول
        </button>
      </div>
    );
  }

  const { name, studentId, email, phoneNumber, educationalStage, role } = profile;


  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.progressPercent / 100) * circumference;

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 md:px-8 lg:px-[120px] font-cairo flex flex-col gap-8 lg:gap-12 items-center overflow-x-hidden" dir="rtl">
      

      <div className="w-full max-w-[1200px] bg-white rounded-[20px] md:rounded-[24px] border border-[#E9E3D8] shadow-[0_8px_24px_-2px_rgba(84,70,58,0.05)] p-5 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full lg:w-auto text-center sm:text-right">
            <div className="w-[80px] h-[80px] md:w-[112px] md:h-[112px] rounded-full border-2 border-[#D4AF37] bg-primary-light flex items-center justify-center shrink-0">
              <User size={36} className="text-[#D4AF37] md:w-[48px] md:h-[48px]" /> 
            </div>
            <div className="flex flex-col gap-2 sm:gap-3 mt-1 sm:mt-2">
              <h1 className="text-[20px] sm:text-[22px] md:text-[26px] font-extrabold text-[#2C2621] leading-tight">
                {name}
              </h1>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-3">
                {studentId && (
                  <span className="bg-primary-light text-[#997D21] text-[11px] sm:text-[12px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {studentId}
                  </span>
                )}
                <span className="text-[13px] sm:text-[14px] md:text-[15px] text-[#6E655F] leading-relaxed max-w-[280px] sm:max-w-none">
                  {role === "STUDENT" ? "طالب أكاديمي في رُقِيّ" : "عضو في رُقِيّ"}
                  {educationalStage ? ` • ${educationalStage}` : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-row items-stretch gap-3 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={openEditModal}
              className="h-[48px] md:h-[50px] px-4 md:px-6 bg-[#D4AF37] text-[#1E1A17] font-bold text-[13px] md:text-[14px] rounded-xl shadow-[0_12px_32px_-4px_rgba(212,175,55,0.1)] hover:bg-[#c29f32] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Settings size={18} />
              تعديل المعلومات
            </button>
            <button
              type="button"
              onClick={() => {
                setPasswordForm({ password: "", confirmPassword: "" });
                setPasswordError(null);
                setShowPasswordModal(true);
              }}
              className="h-[48px] md:h-[50px] px-4 md:px-6 bg-transparent border border-[#E9E3D8] text-[#6E655F] font-bold text-[13px] md:text-[14px] rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <KeyRound size={18} />
              كلمة المرور
            </button>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="h-[48px] md:h-[50px] px-4 md:px-6 bg-transparent border border-[#E9E3D8] text-[#D32F2F] font-bold text-[13px] md:text-[14px] rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <LogOut size={18} />
              تسجيل الخروج
            </button>
          </div>
        </div>

        <div className="w-full h-px bg-[#E9E3D8]"></div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          <div className="flex flex-col gap-1 p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
            <span className="text-[12px] md:text-[13px] text-[#6E655F]">البريد الإلكتروني</span>
            <span className="text-[14px] md:text-[16px] font-bold text-[#2C2621] break-all" dir="ltr">{email}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
            <span className="text-[12px] md:text-[13px] text-[#6E655F]">رقم الهاتف</span>
            <span className="text-[14px] md:text-[16px] font-bold text-[#2C2621]" dir="ltr">{phoneNumber || "—"}</span>
          </div>
          <div className="flex flex-col gap-1 p-3 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none sm:col-span-2 lg:col-span-1">
            <span className="text-[12px] md:text-[13px] text-[#6E655F]">المرحلة الدراسية</span>
            <span className="text-[14px] md:text-[16px] font-bold text-[#2C2621] break-words">{educationalStage || "—"}</span>
          </div>
        </div>
      </div>


      <div className="w-full max-w-[1200px] bg-white rounded-[20px] md:rounded-[24px] border border-[#E9E3D8] shadow-[0_8px_24px_-2px_rgba(84,70,58,0.05)] p-5 sm:p-6 md:p-10 flex flex-col">
        
        <SectionHeader 
          title="مسار التقدم الأكاديمي" 
          subtitle="رصد حي لمستويات التحصيل والمشاهدة وحل الواجبات الشهرية" 
        />

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 mt-2 lg:mt-6">

          <div className="bg-background rounded-[16px] p-6 md:p-8 flex flex-col items-center justify-center gap-6 w-full lg:w-[320px] xl:w-[340px] shrink-0 border border-gray-100 lg:border-none">
            <div className="relative w-[120px] h-[120px] md:w-[130px] md:h-[130px] flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r={radius} fill="none" stroke="#FAF3E6" strokeWidth="12" />
                <circle 
                  cx="50%" cy="50%" r={radius} 
                  fill="none" stroke="#D4AF37" strokeWidth="12" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={strokeDashoffset} 
                  strokeLinecap="round" 
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="text-[20px] md:text-[22px] font-extrabold text-[#2C2621]">{stats.progressPercent}%</span>
            </div>
            <div className="text-center flex flex-col gap-2">
              <h3 className="text-[14px] font-bold text-[#2C2621]">إنجاز المناهج العام</h3>
              <p className="text-[12px] md:text-[13px] text-[#6E655F]">
                {stats.progressPercent > 50 ? "أنت في المسار الصحيح تماماً!" : "استمر في التقدم!"}
              </p>
              <span className="text-[12px] font-bold text-[#22C55E]">+{stats.progressWeekly}٪ تحسن هذا الأسبوع</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6 md:gap-8">
            <div className="bg-background rounded-[16px] p-5 md:p-6 flex flex-col gap-4 border border-gray-100 lg:border-none">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-[13px] md:text-[14px] font-bold text-[#2C2621]">الشهور المنجزة</span>
                <span className="text-[12px] md:text-[13px] text-[#6E655F]">تم إنجاز {stats.monthsCompleted} من أصل {stats.monthsTotal} شهر</span>
              </div>
              <div className="w-full h-[8px] md:h-[10px] bg-primary-light rounded-full overflow-hidden" dir="ltr">
                <div 
                  className="h-full bg-[#D4AF37] rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${stats.monthsTotal > 0 ? (stats.monthsCompleted / stats.monthsTotal) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              <div className="bg-white border border-[#E9E3D8] rounded-[16px] shadow-sm p-4 md:p-5 flex flex-col gap-4 transition-shadow hover:shadow-md">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] md:text-[16px] font-extrabold text-[#2C2621]">الاختبارات الدورية</span>
                  <span className="text-[16px] md:text-[18px] font-extrabold text-[#997D21] bg-primary-light w-8 h-8 flex items-center justify-center rounded-lg">{stats.exams.total}</span>
                </div>
                <div className="w-full h-px bg-[#E9E3D8]"></div>
                <div className="flex flex-col gap-2.5 md:gap-3">
                  <div className="flex justify-between text-[12px] md:text-[13px]">
                    <span className="text-[#6E655F] flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></div>منجزة:</span>
                    <span className="font-bold text-[#22C55E]">{stats.exams.completed}</span>
                  </div>
                  <div className="flex justify-between text-[12px] md:text-[13px]">
                    <span className="text-[#6E655F] flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></div>مستمرة:</span>
                    <span className="font-bold text-[#997D21]">{stats.exams.ongoing}</span>
                  </div>
                  <div className="flex justify-between text-[12px] md:text-[13px]">
                    <span className="text-[#6E655F] flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#E9E3D8]"></div>غير مبدؤة:</span>
                    <span className="font-bold text-[#6E655F]">{stats.exams.notStarted}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E9E3D8] rounded-[16px] shadow-sm p-4 md:p-5 flex flex-col gap-4 transition-shadow hover:shadow-md">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] md:text-[16px] font-extrabold text-[#2C2621]">الواجبات والتطبيقات</span>
                  <span className="text-[16px] md:text-[18px] font-extrabold text-[#997D21] bg-primary-light w-8 h-8 flex items-center justify-center rounded-lg">{stats.homeworks.total}</span>
                </div>
                <div className="w-full h-px bg-[#E9E3D8]"></div>
                <div className="flex flex-col gap-2.5 md:gap-3">
                  <div className="flex justify-between text-[12px] md:text-[13px]">
                    <span className="text-[#6E655F] flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></div>منجزة:</span>
                    <span className="font-bold text-[#22C55E]">{stats.homeworks.completed}</span>
                  </div>
                  <div className="flex justify-between text-[12px] md:text-[13px]">
                    <span className="text-[#6E655F] flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></div>مستمرة:</span>
                    <span className="font-bold text-[#997D21]">{stats.homeworks.ongoing}</span>
                  </div>
                  <div className="flex justify-between text-[12px] md:text-[13px]">
                    <span className="text-[#6E655F] flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#E9E3D8]"></div>غير مبدؤة:</span>
                    <span className="font-bold text-[#6E655F]">{stats.homeworks.notStarted}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="w-full max-w-[1200px] bg-white rounded-[20px] md:rounded-[24px] border border-[#E9E3D8] shadow-[0_8px_24px_-2px_rgba(84,70,58,0.05)] p-5 sm:p-6 md:p-10 flex flex-col">
        
        <SectionHeader 
          title="المنافسة ولوحة الصدارة الدراسية" 
          subtitle="موقعك الحالي بين فرسان الضاد وأبطال الأسبوع" 
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 lg:mt-6">
          <div className="bg-background border border-gray-100 sm:border-none rounded-[16px] p-5 md:p-6 flex flex-col items-center justify-center gap-3">
            <div className="w-[44px] h-[44px] md:w-[48px] md:h-[48px] rounded-full bg-primary-light border-2 border-[#997D21] flex items-center justify-center shrink-0">
              <Sparkles className="text-[#997D21] w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
            </div>
            <span className="text-[13px] md:text-[14px] text-[#6E655F]">مجموع نقاطك</span>
            <span className="text-[20px] md:text-[24px] font-black text-[#2C2621]">{stats.points.toLocaleString("ar-EG")} نقطة</span>
          </div>

          <div className="bg-background border border-gray-100 sm:border-none rounded-[16px] p-5 md:p-6 flex flex-col items-center justify-center gap-3">
            <div className="w-[44px] h-[44px] md:w-[48px] md:h-[48px] rounded-full bg-primary-light border-2 border-[#997D21] flex items-center justify-center shrink-0">
              <Trophy className="text-[#997D21] w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />
            </div>
            <span className="text-[13px] md:text-[14px] text-[#6E655F]">الترتيب العام</span>
            <span className="text-[20px] md:text-[24px] font-black text-[#997D21]">المركز {stats.rank}</span>
          </div>
        </div>

        {stats.pointsToNextRank > 0 && (
          <div className="mt-4 md:mt-6 bg-primary-light rounded-[12px] p-4 flex items-start sm:items-center gap-3">
            <Info className="text-[#997D21] shrink-0 mt-0.5 sm:mt-0" size={20} />
            <p className="text-[13px] md:text-[14px] font-semibold text-[#997D21] leading-relaxed">
              تبقت لك {stats.pointsToNextRank} نقطة فقط لتنتقل إلى المركز {stats.rank > 1 ? stats.rank - 1 : 1} وتتقدم في قائمة الأوائل!
            </p>
          </div>
        )}
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/40 sm:p-4 transition-all duration-300" onClick={() => !savingEdit && setShowEditModal(false)}>
          <div className="w-full sm:max-w-[480px] bg-white rounded-t-[20px] sm:rounded-b-[20px] border border-[#E9E3D8] p-6 md:p-8 shadow-2xl animate-slide-up sm:animate-none" dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
            <h3 className="text-[18px] md:text-[20px] font-extrabold text-[#2C2621] mb-6">تعديل المعلومات</h3>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] md:text-[13px] font-semibold text-[#2C2621]">الاسم الكامل</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full h-[48px] md:h-[50px] rounded-xl border-[1.5px] border-[#E9E3D8] px-4 text-[#2C2621] text-[14px] outline-none focus:border-[#D4AF37] transition-colors bg-background focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] md:text-[13px] font-semibold text-[#2C2621]">رقم الهاتف</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={editForm.phoneNumber}
                  onChange={handleEditChange}
                  placeholder="01xxxxxxxxx"
                  className="w-full h-[48px] md:h-[50px] rounded-xl border-[1.5px] border-[#E9E3D8] px-4 text-[#2C2621] text-[14px] outline-none focus:border-[#D4AF37] transition-colors bg-background focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] md:text-[13px] font-semibold text-[#2C2621]">العنوان</label>
                <input
                  type="text"
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                  className="w-full h-[48px] md:h-[50px] rounded-xl border-[1.5px] border-[#E9E3D8] px-4 text-[#2C2621] text-[14px] outline-none focus:border-[#D4AF37] transition-colors bg-background focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] md:text-[13px] font-semibold text-[#2C2621]">المرحلة الدراسية</label>
                <input
                  type="text"
                  name="educationalStage"
                  value={editForm.educationalStage}
                  onChange={handleEditChange}
                  className="w-full h-[48px] md:h-[50px] rounded-xl border-[1.5px] border-[#E9E3D8] px-4 text-[#2C2621] text-[14px] outline-none focus:border-[#D4AF37] transition-colors bg-background focus:bg-white"
                />
              </div>

              {editError && (
                <p className="text-[13px] text-[#D32F2F] bg-red-50 border border-red-100 rounded-lg p-3 text-center font-medium mt-2">
                  {editError}
                </p>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={savingEdit}
                  className="flex-1 h-[48px] md:h-[50px] bg-white border border-[#E9E3D8] text-[#6E655F] font-bold text-[14px] rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 h-[48px] md:h-[50px] bg-[#D4AF37] text-[#1E1A17] font-bold text-[14px] rounded-xl shadow-[0_4px_12px_rgba(212,175,55,0.2)] hover:bg-[#c29f32] transition-colors disabled:opacity-60"
                >
                  {savingEdit ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {showPasswordModal && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/40 sm:p-4 transition-all duration-300" onClick={() => !savingPassword && setShowPasswordModal(false)}>
          <div className="w-full sm:max-w-[400px] bg-white rounded-t-[20px] sm:rounded-b-[20px] border border-[#E9E3D8] p-6 md:p-8 shadow-2xl animate-slide-up sm:animate-none" dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
            <h3 className="text-[18px] md:text-[20px] font-extrabold text-[#2C2621] mb-6">تغيير كلمة المرور</h3>

            <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] md:text-[13px] font-semibold text-[#2C2621]">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  name="password"
                  value={passwordForm.password}
                  onChange={handlePasswordChange}
                  className="w-full h-[48px] md:h-[50px] rounded-xl border-[1.5px] border-[#E9E3D8] px-4 text-[#2C2621] text-[14px] outline-none focus:border-[#D4AF37] transition-colors bg-background focus:bg-white"
                  dir="ltr"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] md:text-[13px] font-semibold text-[#2C2621]">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full h-[48px] md:h-[50px] rounded-xl border-[1.5px] border-[#E9E3D8] px-4 text-[#2C2621] text-[14px] outline-none focus:border-[#D4AF37] transition-colors bg-background focus:bg-white"
                  dir="ltr"
                />
              </div>

              {passwordError && (
                <p className="text-[13px] text-[#D32F2F] bg-red-50 border border-red-100 rounded-lg p-3 text-center font-medium mt-2">
                  {passwordError}
                </p>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={savingPassword}
                  className="flex-1 h-[48px] md:h-[50px] bg-white border border-[#E9E3D8] text-[#6E655F] font-bold text-[14px] rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex-1 h-[48px] md:h-[50px] bg-[#D4AF37] text-[#1E1A17] font-bold text-[14px] rounded-xl shadow-[0_4px_12px_rgba(212,175,55,0.2)] hover:bg-[#c29f32] transition-colors disabled:opacity-60"
                >
                  {savingPassword ? "جاري الحفظ..." : "حفظ كلمة المرور"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/40 sm:p-4 transition-all duration-300" onClick={() => !loggingOut && setShowLogoutConfirm(false)}>
          <div className="w-full sm:max-w-[400px] bg-white rounded-t-[24px] sm:rounded-b-[24px] border border-[#E9E3D8] p-6 md:p-8 shadow-2xl animate-slide-up sm:animate-none" dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
            <div className="flex flex-col items-center text-center gap-4 mb-8 mt-2">
              <div className="w-14 h-14 rounded-full bg-red-50 border-4 border-white shadow-sm flex items-center justify-center shrink-0">
                <LogOut className="text-[#D32F2F] ml-1" size={24} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[18px] md:text-[20px] font-extrabold text-[#2C2621]">تسجيل الخروج</h3>
                <p className="text-[13px] md:text-[14px] text-[#6E655F]">هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
                className="order-2 sm:order-1 flex-1 h-[48px] md:h-[50px] bg-white border border-[#E9E3D8] text-[#6E655F] font-bold text-[14px] rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="order-1 sm:order-2 flex-1 h-[48px] md:h-[50px] bg-[#D32F2F] text-white font-bold text-[14px] rounded-xl shadow-[0_4px_12px_rgba(211,47,47,0.2)] hover:bg-[#b71c1c] transition-colors disabled:opacity-60"
              >
                {loggingOut ? "جاري الخروج..." : "نعم، تسجيل الخروج"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}