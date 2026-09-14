"use client";

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
  const src =
    role === "TEACHER" ? "/teacher-image.png?v=2" : resolveAvatarSrc(avatar, seed).src;

  return (
    <div className="w-full h-full rounded-full overflow-hidden bg-primary-light">
      <img src={src} alt="الصورة الرمزية" className="w-full h-full object-cover" />
    </div>
  );
}