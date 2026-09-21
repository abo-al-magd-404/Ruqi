// ============= Educational Content: Video =============
// Converts shared YouTube links (youtu.be, /watch, /embed, /shorts) into a
// privacy-friendly embed URL that can also be driven by the JS player API.

export function toEmbedVideoUrl(
  url: string,
  domain: "nocookie" | "youtube" = "nocookie",
): string | null {
  try {
    // Strip tracking subdomains (www./m./music.) then extract the video id
    // from whichever URL shape was shared: youtu.be short links, /watch?v=,
    // /embed/, or /shorts/.
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
    if (u.searchParams.has("si")) embed.searchParams.set("si", u.searchParams.get("si") ?? "");
    embed.searchParams.set("rel", "0");
    embed.searchParams.set("modestbranding", "1");
    embed.searchParams.set("playsinline", "1");
    embed.searchParams.set("iv_load_policy", "3");
    // enablejsapi lets the YouTube IFrame API drive the player
    // (play/pause/seek); the params above hide branding and related videos.
    embed.searchParams.set("enablejsapi", "1");
    return embed.toString();
  } catch {
    return null;
  }
}