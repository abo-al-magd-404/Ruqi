"use client";

// StudentAvatar - renders the profile photo. Teachers always show the fixed
// teacher image; everyone else uses resolveAvatarSrc, which falls back to a
// generated data-URI avatar when no custom image is set.
import { AVATAR_FALLBACK_NAME, resolveAvatarSrc } from "@/lib/avatar";

export default function StudentAvatar({
  avatar,
  seed = AVATAR_FALLBACK_NAME,
  role,
}: {
  avatar: string;
  seed?: string;
  role?: string;
}) {
  // Teachers share a fixed image; students resolve their avatar with a fallback.
  const src =
    role === "TEACHER" ? "/teacher-image.png" : resolveAvatarSrc(avatar, seed).src;

  return (
    <div className="w-full h-full rounded-full overflow-hidden bg-primary-light">
      <img src={src} alt="الصورة الرمزية" className="w-full h-full object-cover" />
    </div>
  );
}