"use client";

// AvatarPicker - interactive avatar builder used wherever a student picks a
// glyph-style avatar (choose-avatar step + edit profile modal). Offers a color
// palette, a horizontal glyph-shape strip and a randomize button; every tweak is
// serialized back into the avatar's string value through avatarStringFromOptions.
import { Shuffle } from "lucide-react";
import {
  avatarDataUri,
  avatarStringFromOptions,
  parseAvatarValue,
  randomAvatarOptions,
  GLYPHS_PALETTE,
  GLYPHS_SHAPE_VARIANTS,
  AVATAR_FALLBACK_NAME,
  type AvatarOptions,
  type GlyphsShapeVariant,
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
  const seed = opts.seed || fallbackName || AVATAR_FALLBACK_NAME;

  const update = (next: AvatarOptions) => onChange(avatarStringFromOptions(next));

  // Toggle the glyph's color; toggling the same color again resets to default.
  const toggleColor = (color: string) => {
    update({ ...opts, seed, glyphColor: opts.glyphColor === color ? undefined : color });
  };

  const toggleShape = (variant: GlyphsShapeVariant) => {
    update({ ...opts, seed, shapeVariant: opts.shapeVariant === variant ? undefined : variant });
  };

  // Randomly roll a complete set of avatar options at once.
  const randomize = () => {
    onChange(avatarStringFromOptions(randomAvatarOptions()));
  };

  const renderThumb = (override: Partial<AvatarOptions>) =>
    avatarDataUri({ ...opts, seed, ...override }, 56);

  return (
    <div className="w-full flex flex-col items-center gap-4 py-0 max-w-full">
      <div
        className="rounded-full border-2 border-primary bg-primary-light shrink-0 overflow-hidden"
        style={{ width: previewSize, height: previewSize }}
      >
        <img src={avatarDataUri(opts, previewSize)} alt="معاينة الصورة الرمزية" className="w-full h-full" />
      </div>

      <div className="w-full flex flex-col gap-2">
        <span className="text-[12px] font-semibold text-text-muted">لون الرمز</span>
        <div className="flex flex-wrap justify-center gap-2" dir="ltr">
          {GLYPHS_PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => toggleColor(color)}
              aria-label={`لون ${color}`}
              className={`w-9 h-9 rounded-full border-2 transition-all ${
                opts.glyphColor === color
                  ? "border-primary ring-2 ring-primary/40 scale-110"
                  : "border-border hover:border-primary/60"
              }`}
              style={{ background: color }}
            />
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col gap-3">
        <span className="text-[12px] font-semibold text-text-muted">الرمز</span>
        <div
          dir="ltr"
          className="avatar-strip flex gap-2 overflow-x-auto py-1.5 [-webkit-overflow-scrolling:touch]"
        >
          {GLYPHS_SHAPE_VARIANTS.map((variant) => (
            <button
              key={variant}
              type="button"
              onClick={() => toggleShape(variant)}
              title={variant}
              className={`shrink-0 w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-xl overflow-hidden border-2 transition-all bg-surface ${
                opts.shapeVariant === variant
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/60"
              }`}
            >
              <img
                src={renderThumb({ shapeVariant: variant })}
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
    </div>
  );
}