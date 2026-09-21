import type { MetadataRoute } from "next";

const BASE_URL = "https://ruqi-five.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
