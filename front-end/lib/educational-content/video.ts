export function toEmbedVideoUrl(
  url: string,
  domain: "nocookie" | "youtube" = "nocookie",
): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^(www\.|m\.|music\.)/, "");
    let videoId: string | null = null;

    if (host === "youtu.be") {
      videoId = u.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch" || u.pathname === "/watch/") {
        videoId = u.searchParams.get("v");
      } else if (u.pathname.startsWith("/embed/")) {
        videoId = u.pathname.split("/").filter(Boolean)[1] ?? null;
      } else if (u.pathname.startsWith("/shorts/")) {
        videoId = u.pathname.split("/").filter(Boolean)[1] ?? null;
      }
    }

    if (!videoId) return null;

    const base =
      domain === "youtube"
        ? "https://www.youtube.com/embed/"
        : "https://www.youtube-nocookie.com/embed/";
    const embed = new URL(`${base}${encodeURIComponent(videoId)}`);
    if (u.searchParams.has("si"))
      embed.searchParams.set("si", u.searchParams.get("si") ?? "");
    embed.searchParams.set("rel", "0");
    embed.searchParams.set("modestbranding", "1");
    embed.searchParams.set("playsinline", "1");
    embed.searchParams.set("iv_load_policy", "3");
    embed.searchParams.set("enablejsapi", "1");
    return embed.toString();
  } catch {
    return null;
  }
}
