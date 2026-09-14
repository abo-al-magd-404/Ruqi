"use client";

import { Shuffle } from "lucide-react";
import {
  avatarDataUri,
  avatarStringFromOptions,
  parseAvatarValue,
  randomAvatarOptions,
  MARBLES_PALETTE,
  MARBLES_TOP_VARIANTS,
  MARBLES_EYES_VARIANTS,
  MARBLES_MOUTH_VARIANTS,
  AVATAR_FALLBACK_NAME,
  type AvatarOptions,
  type MarblesTopVariant,
  type MarblesEyesVariant,
  type MarblesMouthVariant,
} from "@/lib/avatar";

function optionsOf(value: string, fallbackName: string): AvatarOptions {
  return parseAvatarValue(value) ?? { seed: fallbackName || AVATAR_FALLBACK_NAME };
}

export default function AvatarPicker({
  value,
  fallbackName = AVATAR_FALLBACK_NAME,
  previewSize = 112,
  onChange,
}: {
  value: string;
  fallbackName?: string;
  previewSize?: number;
  onChange: (avatar: string) => void;
}) {
  const opts = optionsOf(value, fallbackName);
  const fallback = fallbackName || AVATAR_FALLBACK_NAME;

  const update = (next: AvatarOptions) =>
    onChange(avatarStringFromOptions({ ...next, seed: next.seed.trim() || fallback }));

  const toggleColor = (color: string) => {
    update({ ...opts, sphereColor: opts.sphereColor === color ? undefined : color });
  };

  const toggleTop = (variant: MarblesTopVariant) => {
    update({ ...opts, topVariant: opts.topVariant === variant ? undefined : variant });
  };

  const toggleEyes = (variant: MarblesEyesVariant) => {
    update({ ...opts, eyesVariant: opts.eyesVariant === variant ? undefined : variant });
  };

  const toggleMouth = (variant: MarblesMouthVariant) => {
    update({ ...opts, mouthVariant: opts.mouthVariant === variant ? undefined : variant });
  };

  const randomize = () => {
    onChange(avatarStringFromOptions(randomAvatarOptions()));
  };

  const renderThumb = (override: Partial<AvatarOptions>) =>
    avatarDataUri({ ...opts, seed: opts.seed || fallback, ...override }, 56);

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div
        className="rounded-full border-2 border-primary bg-primary-light shrink-0 overflow-hidden"
        style={{ width: previewSize, height: previewSize }}
      >
        <img src={avatarDataUri(opts, previewSize)} alt="معاينة الصورة الرمزية" className="w-full h-full" />
      </div>

      <div className="w-full flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-text-muted">البذرة (Seed)</label>
        <input
          type="text"
          value={opts.seed}
          onChange={(e) => update({ ...opts, seed: e.target.value })}
          placeholder={fallback}
          className="w-full h-[46px] rounded-xl border-[1.5px] border-border bg-background px-4 text-text-main text-[14px] outline-none focus:border-primary transition-colors text-center"
        />
      </div>

      <div className="w-full flex flex-col gap-2">
        <span className="text-[12px] font-semibold text-text-muted">لون الطابع</span>
        <div className="flex flex-wrap gap-2" dir="ltr">
          {MARBLES_PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => toggleColor(color)}
              aria-label={`لون ${color}`}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                opts.sphereColor === color
                  ? "border-primary ring-2 ring-primary/40 scale-110"
                  : "border-border hover:border-primary/60"
              }`}
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col gap-2">
        <span className="text-[12px] font-semibold text-text-muted">الشعر / القبعة</span>
        <div className="flex gap-2 overflow-x-auto pb-1 px-0.5" dir="ltr">
          {MARBLES_TOP_VARIANTS.map((variant) => (
            <button
              key={variant}
              type="button"
              onClick={() => toggleTop(variant)}
              title={variant}
              className={`shrink-0 w-[52px] h-[52px] rounded-xl overflow-hidden border-2 transition-all bg-surface ${
                opts.topVariant === variant
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/60"
              }`}
            >
              <img
                src={renderThumb({ topVariant: variant })}
                alt={variant}
                className="w-full h-full"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col gap-2">
        <span className="text-[12px] font-semibold text-text-muted">العيون</span>
        <div className="flex gap-2 overflow-x-auto pb-1 px-0.5" dir="ltr">
          {MARBLES_EYES_VARIANTS.map((variant) => (
            <button
              key={variant}
              type="button"
              onClick={() => toggleEyes(variant)}
              title={variant}
              className={`shrink-0 w-[52px] h-[52px] rounded-xl overflow-hidden border-2 transition-all bg-surface ${
                opts.eyesVariant === variant
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/60"
              }`}
            >
              <img
                src={avatarDataUri(
                  { ...opts, seed: opts.seed || fallback, eyesVariant: variant },
                  56,
                )}
                alt={variant}
                className="w-full h-full"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col gap-2">
        <span className="text-[12px] font-semibold text-text-muted">الفم</span>
        <div className="flex gap-2 overflow-x-auto pb-1 px-0.5" dir="ltr">
          {MARBLES_MOUTH_VARIANTS.map((variant) => (
            <button
              key={variant}
              type="button"
              onClick={() => toggleMouth(variant)}
              title={variant}
              className={`shrink-0 w-[52px] h-[52px] rounded-xl overflow-hidden border-2 transition-all bg-surface ${
                opts.mouthVariant === variant
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/60"
              }`}
            >
              <img
                src={avatarDataUri(
                  { ...opts, seed: opts.seed || fallback, mouthVariant: variant },
                  56,
                )}
                alt={variant}
                className="w-full h-full"
              />
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={randomize}
        className="flex items-center justify-center gap-2 h-[44px] w-full rounded-xl bg-primary text-text-main font-bold text-[14px] hover:bg-primary-hover transition-colors"
      >
        <Shuffle size={18} />
        توليد عشوائي
      </button>

      <p className="text-[11px] text-text-muted font-medium text-center max-w-[320px]">
        اختر اللون والشكل والعيون والفم، أو اضغط «توليد عشوائي» — البذرة تحدد هوية الصورة وتجمع الخيارات
      </p>
    </div>
  );
}