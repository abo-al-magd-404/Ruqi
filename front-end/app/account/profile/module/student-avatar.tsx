"use client";

import Image from "next/image";
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
    role === "TEACHER"
      ? "/teacher-image.png"
      : resolveAvatarSrc(avatar, seed).src;

  return (
    <div className="relative w-full h-full rounded-full overflow-hidden bg-primary-light">
      <Image
        src={src}
        alt="الصورة الرمزية"
        fill
        unoptimized
        className="object-cover"
      />
    </div>
  );
}
