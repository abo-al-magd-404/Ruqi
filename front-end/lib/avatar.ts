// ============= Avatar Utilities =============
// Generates, parses, and resolves student avatars. Most rules use a plain
// seed string rendered as a DiceBear glyphs data-URI; avatars may also be an
// uploaded image URL, a long DiceBear URL, or a legacy JSON config. Exports:
// avatarDataUri, avatarUrl, parseAvatarValue, resolveAvatarSrc,
// randomAvatarOptions, isAvatarImage/isAvatarSeed, pendingAvatarStorage.

import { Style, Avatar } from "@dicebear/core";
import glyphs from "@dicebear/styles/glyphs.json" with { type: "json" };

export const AVATAR_FALLBACK_NAME = "رقي";

const AVATAR_STYLE = new Style(glyphs);
const DATA_URI_CACHE = new Map<string, string>();

export const GLYPHS_PALETTE = [
  "#76a7ff",
  "#525fa3",
  "#8c8c8c",
  "#75c675",
  "#ffaa64",
  "#ff4d6f",
  "#af61f2",
] as const;

export const GLYPHS_SHAPE_VARIANTS = [
  "variant01",
  "variant02",
  "variant03",
  "variant04",
  "variant05",
  "variant06",
  "variant07",
  "variant08",
  "variant09",
  "variant10",
  "variant11",
  "variant12",
  "variant13",
  "variant14",
  "variant15",
  "variant16",
  "variant17",
  "variant18",
  "variant19",
  "variant20",
  "variant21",
  "variant22",
  "variant23",
  "variant24",
  "variant25",
  "variant26",
  "variant27",
  "variant28",
  "variant29",
  "variant30",
  "variant31",
  "variant32",
  "variant33",
  "variant34",
  "variant35",
] as const;

export type GlyphsShapeVariant = (typeof GLYPHS_SHAPE_VARIANTS)[number];

export interface AvatarOptions {
  seed: string;
  glyphColor?: string;
  shapeVariant?: GlyphsShapeVariant;
}

function cacheKey(opts: AvatarOptions, size: number): string {
  return `${size}|${opts.seed}|${opts.glyphColor ?? ""}|${opts.shapeVariant ?? ""}`;
}

function avatarStyleOptions(opts: AvatarOptions) {
  return {
    seed: opts.seed.trim() || AVATAR_FALLBACK_NAME,
    ...(opts.glyphColor ? { glyphColor: [opts.glyphColor] } : {}),
    ...(opts.shapeVariant ? { shapeVariant: opts.shapeVariant } : {}),
  };
}

export function avatarDataUri(
  seedOrOptions: string | AvatarOptions | null | undefined,
  size = 128,
): string {
  const opts: AvatarOptions =
    typeof seedOrOptions === "string" || seedOrOptions == null
      ? { seed: seedOrOptions?.trim() || AVATAR_FALLBACK_NAME }
      : seedOrOptions;
  const key = cacheKey(opts, size);
  // Reuse previously generated data-URIs so repeated renders are cheap.
  if (DATA_URI_CACHE.has(key)) return DATA_URI_CACHE.get(key)!;
  const uri = new Avatar(AVATAR_STYLE, { ...avatarStyleOptions(opts), size }).toDataUri();
  DATA_URI_CACHE.set(key, uri);
  return uri;
}

export function avatarUrl(options: AvatarOptions | string): string {
  const opts: AvatarOptions =
    typeof options === "string" ? { seed: options } : options;
  const params = new URLSearchParams({
    seed: opts.seed.trim() || AVATAR_FALLBACK_NAME,
  });
  if (opts.glyphColor) params.set("glyphColor", opts.glyphColor.replace("#", ""));
  if (opts.shapeVariant) params.set("shapeVariant", opts.shapeVariant);
  return `https://api.dicebear.com/10.x/glyphs/svg?${params.toString()}`;
}

export function avatarStringFromOptions(opts: AvatarOptions): string {
  const hasCustom = Boolean(opts.glyphColor) || Boolean(opts.shapeVariant);
  const seed = opts.seed.trim() || AVATAR_FALLBACK_NAME;
  return hasCustom ? avatarUrl({ ...opts, seed }) : seed;
}

export function randomAvatarOptions(): AvatarOptions {
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
  return {
    seed: Math.random().toString(36).slice(2, 10),
    glyphColor: pick(GLYPHS_PALETTE),
    shapeVariant: pick(GLYPHS_SHAPE_VARIANTS),
  };
}

const DICEBEAR_URL_RE = /^https?:\/\/api\.dicebear\.com\/\d+\.x\/glyphs\/svg\?/i;

// ============= Parsing & Resolving =============

export function parseAvatarValue(value: string | null | undefined): AvatarOptions | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // A full DiceBear URL is parsed back into its options so it can be
  // re-rendered locally as a data-URI.
  if (DICEBEAR_URL_RE.test(trimmed)) {
    let searchParams: URLSearchParams;
    try {
      searchParams = new URL(trimmed).searchParams;
    } catch {
      return null;
    }
    const seed = searchParams.get("seed")?.trim() || AVATAR_FALLBACK_NAME;
    const glyphColor = searchParams.get("glyphColor");
    const shapeVariant = searchParams.get("shapeVariant");
    return {
      seed,
      ...(glyphColor ? { glyphColor: `#${glyphColor}` } : {}),
      ...(shapeVariant ? { shapeVariant: shapeVariant as GlyphsShapeVariant } : {}),
    };
  }

  if (isAvatarImage(trimmed) || !isAvatarSeed(trimmed)) return null;
  return { seed: trimmed };
}

export function avatarDataUriFromValue(
  value: string | null | undefined,
  fallbackSeed = AVATAR_FALLBACK_NAME,
  size = 128,
): string {
  const parsed = parseAvatarValue(value);
  return avatarDataUri(parsed ?? { seed: fallbackSeed }, size);
}

export function isAvatarImage(avatar: string | null | undefined): boolean {
  if (!avatar) return false;
  return (
    avatar.startsWith("/") ||
    avatar.startsWith("data:") ||
    /^https?:\/\//i.test(avatar)
  );
}

export function isAvatarSeed(avatar: string | null | undefined): boolean {
  if (!avatar || isAvatarImage(avatar)) return false;
  const trimmed = avatar.trim();
  if (trimmed.startsWith("{")) return false;
  if (EMOJI_RE.test(trimmed)) return false;
  return trimmed.length > 0;
}

const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B50}\u{2764}]/u;

export function resolveAvatarSrc(
  avatar: string | null | undefined,
  fallbackSeed = AVATAR_FALLBACK_NAME,
): { isImage: boolean; src: string; seed: string } {
  // Priority: explicit options → legacy JSON config → raw image URL → seed
  // string. Returns whether the value should be rendered as an <img>.
  const parsed = parseAvatarValue(avatar);
  if (parsed) {
    return { isImage: false, src: avatarDataUri(parsed), seed: parsed.seed };
  }
  const legacy = legacyAvatarOptions(avatar);
  if (legacy) {
    return { isImage: false, src: avatarDataUri(legacy), seed: legacy.seed };
  }
  if (isAvatarImage(avatar)) {
    return { isImage: true, src: avatar as string, seed: fallbackSeed };
  }
  const seed = isAvatarSeed(avatar) ? (avatar as string) : fallbackSeed;
  return { isImage: false, src: avatarDataUri(seed), seed };
}

function hashSeed(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!match) return null;
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function nearestPaletteColor(hex: string): string | undefined {
  const rgb = hexToRgb(hex);
  if (!rgb) return undefined;
  let best: string | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of GLYPHS_PALETTE) {
    const candidateRgb = hexToRgb(candidate);
    if (!candidateRgb) continue;
    const distance =
      (rgb[0] - candidateRgb[0]) ** 2 +
      (rgb[1] - candidateRgb[1]) ** 2 +
      (rgb[2] - candidateRgb[2]) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  return best;
}

// Old avatars were stored as a JSON config string (e.g. { faceColor: ... }).
// Map them to a stable seed derived from a hash of the JSON, snapping the
// legacy face color to the nearest brand palette color.
function legacyAvatarOptions(avatar: string | null | undefined): AvatarOptions | null {
  if (!avatar) return null;
  const trimmed = avatar.trim();
  if (!trimmed.startsWith("{")) return null;

  let cfg: Record<string, unknown>;
  try {
    cfg = JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (!cfg || typeof cfg !== "object") return null;

  const opts: AvatarOptions = { seed: hashSeed(trimmed) };

  const faceColor = typeof cfg.faceColor === "string" ? cfg.faceColor : undefined;
  if (faceColor) opts.glyphColor = nearestPaletteColor(faceColor);

  return opts;
}

// ============= Pending Avatar (localStorage) =============

export function pendingAvatarStorage() {
  const KEY = "ruqi_pending_avatar";
  return {
    get: (): string | null => {
      try {
        return localStorage.getItem(KEY);
      } catch {
        return null;
      }
    },
    set: (seed: string) => {
      try {
        localStorage.setItem(KEY, seed);
      } catch {}
    },
    clear: () => {
      try {
        localStorage.removeItem(KEY);
      } catch {}
    },
  };
}