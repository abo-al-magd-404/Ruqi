import { Style, Avatar } from "@dicebear/core";
import marbles from "@dicebear/styles/marbles.json" with { type: "json" };

export const AVATAR_FALLBACK_NAME = "رقي";

const AVATAR_STYLE = new Style(marbles);
const DATA_URI_CACHE = new Map<string, string>();

export const MARBLES_PALETTE = [
  "#fe9596",
  "#fe9a6e",
  "#fc9f13",
  "#dbb313",
  "#b3c414",
  "#68d54e",
  "#18d79b",
  "#17d2c7",
  "#17cde9",
  "#5ac3fe",
  "#8eb8fe",
  "#aeadfe",
  "#d19dfe",
  "#fe81ef",
  "#fe8fba",
] as const;

export const MARBLES_TOP_VARIANTS = [
  "sunhat",
  "cap",
  "headphones",
  "beanie",
  "afro",
  "spikes",
  "crimp",
  "garland",
  "shag",
  "curl",
  "curls",
  "ringlets",
  "zigzag",
  "flick",
  "tuft",
  "swirl",
  "antenna",
  "cowlick",
  "bow",
  "knot",
] as const;

export const MARBLES_EYES_VARIANTS = [
  "dots",
  "wide",
  "closed",
  "happy",
  "wink",
  "sleepy",
  "squint",
  "uneven",
  "oval",
] as const;

export const MARBLES_MOUTH_VARIANTS = [
  "smile",
  "grin",
  "small",
  "smirk",
  "line",
  "wavy",
  "jagged",
  "open",
  "pout",
  "cat",
  "tongue",
] as const;

export type MarblesTopVariant = (typeof MARBLES_TOP_VARIANTS)[number];
export type MarblesEyesVariant = (typeof MARBLES_EYES_VARIANTS)[number];
export type MarblesMouthVariant = (typeof MARBLES_MOUTH_VARIANTS)[number];

export interface AvatarOptions {
  seed: string;
  sphereColor?: string;
  topVariant?: MarblesTopVariant;
  eyesVariant?: MarblesEyesVariant;
  mouthVariant?: MarblesMouthVariant;
}

function cacheKey(opts: AvatarOptions, size: number): string {
  return `${size}|${opts.seed}|${opts.sphereColor ?? ""}|${opts.topVariant ?? ""}|${opts.eyesVariant ?? ""}|${opts.mouthVariant ?? ""}`;
}

function avatarStyleOptions(opts: AvatarOptions) {
  return {
    seed: opts.seed.trim() || AVATAR_FALLBACK_NAME,
    ...(opts.sphereColor ? { sphereColor: [opts.sphereColor] } : {}),
    ...(opts.topVariant ? { topVariant: opts.topVariant } : {}),
    ...(opts.eyesVariant ? { eyesVariant: opts.eyesVariant } : {}),
    ...(opts.mouthVariant ? { mouthVariant: opts.mouthVariant } : {}),
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
  if (opts.sphereColor) params.set("sphereColor", opts.sphereColor.replace("#", ""));
  if (opts.topVariant) params.set("topVariant", opts.topVariant);
  if (opts.eyesVariant) params.set("eyesVariant", opts.eyesVariant);
  if (opts.mouthVariant) params.set("mouthVariant", opts.mouthVariant);
  return `https://api.dicebear.com/10.x/marbles/svg?${params.toString()}`;
}

export function avatarStringFromOptions(opts: AvatarOptions): string {
  const hasCustom =
    Boolean(opts.sphereColor) ||
    Boolean(opts.topVariant) ||
    Boolean(opts.eyesVariant) ||
    Boolean(opts.mouthVariant);
  const seed = opts.seed.trim() || AVATAR_FALLBACK_NAME;
  return hasCustom ? avatarUrl({ ...opts, seed }) : seed;
}

export function randomAvatarOptions(): AvatarOptions {
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
  return {
    seed: Math.random().toString(36).slice(2, 10),
    sphereColor: pick(MARBLES_PALETTE),
    ...(Math.random() < 0.85 ? { topVariant: pick(MARBLES_TOP_VARIANTS) } : {}),
    ...(Math.random() < 0.85 ? { eyesVariant: pick(MARBLES_EYES_VARIANTS) } : {}),
    ...(Math.random() < 0.85 ? { mouthVariant: pick(MARBLES_MOUTH_VARIANTS) } : {}),
  };
}

const DICEBEAR_URL_RE = /^https?:\/\/api\.dicebear\.com\/10\.x\/marbles\/svg\?/i;

export function parseAvatarValue(value: string | null | undefined): AvatarOptions | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (DICEBEAR_URL_RE.test(trimmed)) {
    let searchParams: URLSearchParams;
    try {
      searchParams = new URL(trimmed).searchParams;
    } catch {
      return null;
    }
    const seed = searchParams.get("seed")?.trim() || AVATAR_FALLBACK_NAME;
    const sphereColor = searchParams.get("sphereColor");
    const topVariant = searchParams.get("topVariant");
    const eyesVariant = searchParams.get("eyesVariant");
    const mouthVariant = searchParams.get("mouthVariant");
    return {
      seed,
      ...(sphereColor ? { sphereColor: `#${sphereColor}` } : {}),
      ...(topVariant ? { topVariant: topVariant as MarblesTopVariant } : {}),
      ...(eyesVariant ? { eyesVariant: eyesVariant as MarblesEyesVariant } : {}),
      ...(mouthVariant ? { mouthVariant: mouthVariant as MarblesMouthVariant } : {}),
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

const LEGACY_TOP_MAP: Record<string, MarblesTopVariant | undefined> = {
  thick: "shag",
  mohawk: "spikes",
  womanLong: "ringlets",
  long: "ringlets",
  womanShort: "curl",
  manShort: "flick",
  manLong: "swirl",
  manSides: "afro",
  curly: "curls",
  curlyShort: "curl",
  afro: "afro",
  bob: "bow",
  bun: "knot",
  doubleBun: "knot",
  puff: "tuft",
  flatTop: "tuft",
  pompadour: "swirl",
};

const LEGACY_EYES_MAP: Record<string, MarblesEyesVariant | undefined> = {
  smile: "happy",
  oval: "oval",
  shadow: "closed",
};

const LEGACY_MOUTH_MAP: Record<string, MarblesMouthVariant | undefined> = {
  laugh: "grin",
  smile: "smile",
  peace: "line",
  smirk: "smirk",
};

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
  for (const candidate of MARBLES_PALETTE) {
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
  if (faceColor) opts.sphereColor = nearestPaletteColor(faceColor);

  const hairStyle = typeof cfg.hairStyle === "string" ? cfg.hairStyle : undefined;
  if (hairStyle && LEGACY_TOP_MAP[hairStyle]) opts.topVariant = LEGACY_TOP_MAP[hairStyle];

  const eyeStyle = typeof cfg.eyeStyle === "string" ? cfg.eyeStyle : undefined;
  if (eyeStyle && LEGACY_EYES_MAP[eyeStyle]) opts.eyesVariant = LEGACY_EYES_MAP[eyeStyle];

  const mouthStyle = typeof cfg.mouthStyle === "string" ? cfg.mouthStyle : undefined;
  if (mouthStyle && LEGACY_MOUTH_MAP[mouthStyle]) opts.mouthVariant = LEGACY_MOUTH_MAP[mouthStyle];

  return opts;
}

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