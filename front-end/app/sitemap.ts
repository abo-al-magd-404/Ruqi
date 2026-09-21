import type { MetadataRoute } from "next";

const BASE_URL = "https://ruqi-five.vercel.app";
const API_BASE_URL = "https://app-6ab05d7e.deploy.meerasolution.com";

interface EducationalStage {
  _id: string;
}

interface StagesResponse {
  data: EducationalStage[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/educational-content`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  try {
    const response = await fetch(`${API_BASE_URL}/educational-content/stages`, {
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      return staticPages;
    }

    const result: StagesResponse = await response.json();

    const stagePages: MetadataRoute.Sitemap = result.data.map((stage) => ({
      url: `${BASE_URL}/educational-content/stage/${stage._id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticPages, ...stagePages];
  } catch {
    return staticPages;
  }
}
