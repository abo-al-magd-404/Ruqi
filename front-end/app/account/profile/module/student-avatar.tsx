"use client";

import NiceAvatar from "react-nice-avatar";
import { AVATAR_FALLBACK_NAME, defaultAvatarConfig, isAvatarImage, parseAvatarConfig } from "@/lib/avatar";

export default function StudentAvatar({
  avatar,
  seed = AVATAR_FALLBACK_NAME,
}: {
  avatar: string;
  seed?: string;
}) {
  const config = parseAvatarConfig(avatar);
  if (config) {
    return <NiceAvatar style={{ width: "100%", height: "100%" }} shape="circle" {...config} />;
  }
  if (isAvatarImage(avatar)) {
    return (
      <div
        className="w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url('${avatar}')` }}
        role="img"
        aria-label="الصورة الرمزية"
      />
    );
  }
  return <NiceAvatar style={{ width: "100%", height: "100%" }} shape="circle" {...defaultAvatarConfig(seed)} />;
}