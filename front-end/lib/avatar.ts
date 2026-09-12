import { genConfig } from "react-nice-avatar";
import type { AvatarFullConfig } from "react-nice-avatar";

export const AVATAR_FALLBACK_NAME = "رقي";

export function isAvatarImage(avatar: string): boolean {
  if (!avatar) return false;
  return avatar.startsWith("/") || /^https?:\/\//i.test(avatar);
}

export function isAvatarConfig(avatar: string): boolean {
  return avatar.startsWith("{");
}

export function parseAvatarConfig(avatar: string): AvatarFullConfig | null {
  if (!isAvatarConfig(avatar)) return null;
  try {
    const parsed = JSON.parse(avatar) as AvatarFullConfig;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function avatarConfigToJson(config: AvatarFullConfig): string {
  return JSON.stringify(config);
}

export function defaultAvatarConfig(seed = AVATAR_FALLBACK_NAME): AvatarFullConfig {
  return genConfig(seed);
}

export function randomAvatarConfig(): AvatarFullConfig {
  return genConfig();
}