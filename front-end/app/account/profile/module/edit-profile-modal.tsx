import { useState } from "react";
import type { EducationalStage } from "@/lib/types/educational-content";
import NiceAvatar, { genConfig } from "react-nice-avatar";
import type {
  AvatarFullConfig,
  EarSize,
  EyeBrowStyle,
  EyeStyle,
  GlassesStyle,
  HairStyle,
  HatStyle,
  MouthStyle,
  NoseStyle,
  Sex,
  ShirtStyle,
} from "react-nice-avatar";
import { Dices } from "lucide-react";
import { defaultAvatarConfig, parseAvatarConfig } from "@/lib/avatar";

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "man", label: "صبي" },
  { value: "woman", label: "بنت" },
];

const MAN_HAIR_STYLES: { value: HairStyle; label: string }[] = [
  { value: "normal", label: "عادي" },
  { value: "thick", label: "كثيف" },
  { value: "mohawk", label: "موهاك" },
];

const WOMAN_HAIR_STYLES: { value: HairStyle; label: string }[] = [
  { value: "normal", label: "عادي" },
  { value: "womanLong", label: "طويل" },
  { value: "womanShort", label: "قصير" },
];

const HAT_STYLES: { value: HatStyle; label: string }[] = [
  { value: "none", label: "بدون" },
  { value: "beanie", label: "بياني" },
  { value: "turban", label: "عمامة" },
];

const EYE_STYLES: { value: EyeStyle; label: string }[] = [
  { value: "circle", label: "دائري" },
  { value: "oval", label: "بيضاوي" },
  { value: "smile", label: "ضاحك" },
];

const GLASSES_STYLES: { value: GlassesStyle; label: string }[] = [
  { value: "none", label: "بدون" },
  { value: "round", label: "دائرية" },
  { value: "square", label: "مربعة" },
];

const NOSE_STYLES: { value: NoseStyle; label: string }[] = [
  { value: "short", label: "قصير" },
  { value: "long", label: "طويل" },
  { value: "round", label: "دائري" },
];

const MOUTH_STYLES: { value: MouthStyle; label: string }[] = [
  { value: "laugh", label: "ضحك" },
  { value: "smile", label: "ابتسامة" },
  { value: "peace", label: "سلام" },
];

const SHIRT_STYLES: { value: ShirtStyle; label: string }[] = [
  { value: "hoody", label: "هودي" },
  { value: "short", label: "قصير" },
  { value: "polo", label: "بولو" },
];

const EAR_SIZES: { value: EarSize; label: string }[] = [
  { value: "small", label: "صغير" },
  { value: "big", label: "كبير" },
];

const EYEBROW_WOMAN: { value: EyeBrowStyle; label: string }[] = [
  { value: "up", label: "مرفوعة" },
  { value: "upWoman", label: "المستديرة" },
];

const FACE_COLORS = ["#F9C9B6", "#AC6651"];
const HAIR_COLORS = ["#000", "#fff", "#77311D", "#FC909F", "#D2EFF3", "#506AF4", "#F48150"];
const HAT_COLORS = ["#000", "#fff", "#77311D", "#FC909F", "#D2EFF3", "#506AF4", "#F48150"];
const SHIRT_COLORS = ["#9287FF", "#6BD9E9", "#FC909F", "#F4D150", "#77311D"];
const BG_COLORS = [
  "#9287FF",
  "#6BD9E9",
  "#FC909F",
  "#F4D150",
  "#E0DDFF",
  "#D2EFF3",
  "#FFEDEF",
  "#FFEBA4",
  "#506AF4",
  "#F48150",
  "#74D153",
];
const GRADIENT_BGS = [
  "linear-gradient(45deg, #178bff 0%, #ff6868 100%)",
  "linear-gradient(45deg, #176fff 0%, #68ffef 100%)",
  "linear-gradient(45deg, #ff1717 0%, #ffd368 100%)",
  "linear-gradient(90deg, #36cd1c 0%, #68deff 100%)",
  "linear-gradient(45deg, #3e1ccd 0%, #ff6871 100%)",
  "linear-gradient(45deg, #1729ff 0%, #ff56f7 100%)",
  "linear-gradient(45deg, #56b5f0 0%, #45ccb5 100%)",
];

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  form: { name: string; phoneNumber: string; address: string; stage: string; avatar: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  error: string | null;
  stages: EducationalStage[];
  initialSection?: "data" | "avatar";
}

function PillRow<T extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: { value: T; label: string }[];
  value?: T;
  onSelect: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] font-semibold text-text-muted">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onSelect(o.value)}
            className={`px-3 h-8 rounded-lg text-[12px] font-bold transition-colors border ${
              value === o.value
                ? "bg-primary border-primary text-text-main"
                : "bg-surface border-border text-text-muted hover:border-primary/50"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorRow({
  label,
  colors,
  value,
  onSelect,
}: {
  label: string;
  colors: string[];
  value?: string;
  onSelect: (c: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] font-semibold text-text-muted">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onSelect(c)}
            className={`w-8 h-8 rounded-full border transition-all ${
              value === c
                ? "border-primary ring-2 ring-primary/40 scale-110"
                : "border-border hover:border-primary/50"
            }`}
            style={{ background: c }}
            aria-label={label}
          />
        ))}
      </div>
    </div>
  );
}

export default function EditProfileModal({
  open,
  onClose,
  form,
  onChange,
  onSubmit,
  saving,
  error,
  stages,
  initialSection = "data",
}: EditProfileModalProps) {
  const [section, setSection] = useState<"data" | "avatar">(initialSection);
  const [prevOpen, setPrevOpen] = useState(open);
  const [draft, setDraft] = useState<AvatarFullConfig>(() =>
    parseAvatarConfig(form.avatar) ?? defaultAvatarConfig()
  );

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSection(initialSection);
      setDraft(parseAvatarConfig(form.avatar) ?? defaultAvatarConfig());
    }
  }

  if (!open) return null;

  const commit = (config: AvatarFullConfig) => {
    setDraft(config);
    onChange({
      target: { name: "avatar", value: JSON.stringify(config) },
    } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>);
  };

  const setConfig = (patch: Partial<AvatarFullConfig>) => {
    commit(genConfig({ ...draft, ...patch }));
  };

  const randomize = () => {
    commit(genConfig());
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/40 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => !saving && onClose()}
    >
      <div
        className="w-full sm:max-w-[480px] bg-surface rounded-t-[20px] sm:rounded-b-[20px] border border-border p-6 md:p-8 shadow-2xl"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[20px] font-extrabold text-text-main mb-6 text-center">تعديل المعلومات</h3>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex gap-2 p-1 bg-surface-secondary rounded-xl">
            <button
              type="button"
              onClick={() => setSection("data")}
              className={`flex-1 h-[42px] rounded-lg font-bold text-[14px] transition-colors ${
                section === "data" ? "bg-primary text-text-main" : "text-text-muted hover:bg-surface"
              }`}
            >
              البيانات
            </button>
            <button
              type="button"
              onClick={() => setSection("avatar")}
              className={`flex-1 h-[42px] rounded-lg font-bold text-[14px] transition-colors ${
                section === "avatar" ? "bg-primary text-text-main" : "text-text-muted hover:bg-surface"
              }`}
            >
              الصورة الرمزية
            </button>
          </div>

          {section === "avatar" && (
            <div className="flex flex-col gap-3 pb-2 max-h-[420px] overflow-y-auto">
              <div className="flex items-center justify-center gap-4">
                <div className="w-[104px] h-[104px] rounded-full border-2 border-primary bg-primary-light shrink-0 overflow-hidden">
                  <NiceAvatar style={{ width: "100%", height: "100%" }} shape="circle" {...draft} />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <button
                    type="button"
                    onClick={randomize}
                    className="flex items-center justify-center gap-2 h-[42px] px-4 rounded-xl bg-primary text-text-main font-bold text-[13px] hover:bg-primary-hover transition-colors"
                  >
                    <Dices size={16} />
                    توليد عشوائي
                  </button>
                  <span className="text-[11px] text-text-muted font-medium">
                    غيّر التفاصيل أو ولّد صورة عشوائية
                  </span>
                </div>
              </div>

              <PillRow label="الجنس" options={SEX_OPTIONS} value={draft.sex} onSelect={(v) => setConfig({ sex: v })} />
              <ColorRow
                label="لون البشرة"
                colors={FACE_COLORS}
                value={draft.faceColor}
                onSelect={(c) => setConfig({ faceColor: c })}
              />
              <PillRow
                label="تسريحة الشعر"
                options={draft.sex === "woman" ? WOMAN_HAIR_STYLES : MAN_HAIR_STYLES}
                value={draft.hairStyle}
                onSelect={(v) => setConfig({ hairStyle: v })}
              />
              <ColorRow
                label="لون الشعر"
                colors={HAIR_COLORS}
                value={draft.hairColor}
                onSelect={(c) => setConfig({ hairColor: c })}
              />
              <PillRow
                label="الغطاء"
                options={HAT_STYLES}
                value={draft.hatStyle}
                onSelect={(v) => setConfig({ hatStyle: v })}
              />
              {draft.hatStyle !== "none" && (
                <ColorRow
                  label="لون الغطاء"
                  colors={HAT_COLORS}
                  value={draft.hatColor}
                  onSelect={(c) => setConfig({ hatColor: c })}
                />
              )}
              <PillRow
                label="العيون"
                options={EYE_STYLES}
                value={draft.eyeStyle}
                onSelect={(v) => setConfig({ eyeStyle: v })}
              />
              {draft.sex === "woman" && (
                <PillRow
                  label="الحواجب"
                  options={EYEBROW_WOMAN}
                  value={draft.eyeBrowStyle}
                  onSelect={(v) => setConfig({ eyeBrowStyle: v })}
                />
              )}
              <PillRow
                label="النظارة"
                options={GLASSES_STYLES}
                value={draft.glassesStyle}
                onSelect={(v) => setConfig({ glassesStyle: v })}
              />
              <PillRow
                label="الأنف"
                options={NOSE_STYLES}
                value={draft.noseStyle}
                onSelect={(v) => setConfig({ noseStyle: v })}
              />
              <PillRow
                label="الفم"
                options={MOUTH_STYLES}
                value={draft.mouthStyle}
                onSelect={(v) => setConfig({ mouthStyle: v })}
              />
              <PillRow
                label="الأذنان"
                options={EAR_SIZES}
                value={draft.earSize}
                onSelect={(v) => setConfig({ earSize: v })}
              />
              <PillRow
                label="الملابس"
                options={SHIRT_STYLES}
                value={draft.shirtStyle}
                onSelect={(v) => setConfig({ shirtStyle: v })}
              />
              <ColorRow
                label="لون الملابس"
                colors={SHIRT_COLORS}
                value={draft.shirtColor}
                onSelect={(c) => setConfig({ shirtColor: c })}
              />
              <ColorRow
                label="الخلفية"
                colors={BG_COLORS}
                value={draft.bgColor}
                onSelect={(c) => setConfig({ bgColor: c })}
              />
              <ColorRow
                label="خلفية متدرجة"
                colors={GRADIENT_BGS}
                value={draft.bgColor}
                onSelect={(c) => setConfig({ bgColor: c })}
              />
            </div>
          )}

          {section === "data" && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-text-main">الاسم الكامل</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="w-full h-[48px] rounded-xl border-[1.5px] border-border px-4 text-text-main text-[14px] outline-none focus:border-primary transition-colors bg-background focus:bg-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-text-main">رقم الهاتف</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={onChange}
                  placeholder="01xxxxxxxxx"
                  className="w-full h-[48px] rounded-xl border-[1.5px] border-border px-4 text-text-main text-[14px] outline-none focus:border-primary transition-colors bg-background focus:bg-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-text-main">العنوان</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  className="w-full h-[48px] rounded-xl border-[1.5px] border-border px-4 text-text-main text-[14px] outline-none focus:border-primary transition-colors bg-background focus:bg-surface"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold text-text-main">المرحلة الدراسية</label>
                <select
                  name="stage"
                  value={form.stage}
                  onChange={onChange}
                  className="w-full h-[48px] rounded-xl border-[1.5px] border-border px-4 text-text-main text-[14px] outline-none focus:border-primary transition-colors bg-background focus:bg-surface appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    اختر المرحلة
                  </option>
                  {stages.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-danger bg-danger-bg border border-danger rounded-lg p-3 text-center font-medium">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 h-[48px] bg-transparent border border-border text-text-muted font-bold text-[14px] rounded-xl hover:bg-surface-secondary transition-colors disabled:opacity-60"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-[48px] bg-primary text-text-main font-bold text-[14px] rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-60"
            >
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}