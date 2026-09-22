import type { MetadataRoute } from "next";

const BASE_URL = "https://ruqi-five.vercel.app";
const API_BASE_URL = "https://app-6ab05d7e.deploy.meerasolution.com";

interface EducationalStage {
  _id: string;
}

interface EducationalMonth {
  _id: string;
}

interface EducationalContent {
  _id: string;
  type: "LESSON" | "EXAM";
}

interface MonthContentResponse {
  items: EducationalContent[];
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
    // Get stages
    const stagesResponse = await fetch(
      `${API_BASE_URL}/educational-content/stages`,
      {
        next: {
          revalidate: 3600,
        },
      },
    );

    if (!stagesResponse.ok) {
      return staticPages;
    }

    const stages: EducationalStage[] = await stagesResponse.json();

    const stagePages: MetadataRoute.Sitemap = stages.map((stage) => ({
      url: `${BASE_URL}/educational-content/stage/${stage._id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Get months for all stages
    const monthsResponses = await Promise.all(
      stages.map(async (stage) => {
        const response = await fetch(
          `${API_BASE_URL}/educational-content/months/stage/${stage._id}`,
          {
            next: {
              revalidate: 3600,
            },
          },
        );

        if (!response.ok) {
          return [] as EducationalMonth[];
        }

        return (await response.json()) as EducationalMonth[];
      }),
    );

    const months = monthsResponses.flat();

    const monthPages: MetadataRoute.Sitemap = months.map((month) => ({
      url: `${BASE_URL}/educational-content/month/${month._id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    // Get lessons and exams for all months
    const contentResponses = await Promise.all(
      months.map(async (month) => {
        const response = await fetch(
          `${API_BASE_URL}/educational-content/content/month/${month._id}`,
          {
            next: {
              revalidate: 3600,
            },
          },
        );

        if (!response.ok) {
          return [] as EducationalContent[];
        }

        const result = (await response.json()) as MonthContentResponse;

        return result.items;
      }),
    );

    const contents = contentResponses.flat();

    const contentPages: MetadataRoute.Sitemap = contents.map((content) => ({
      url:
        content.type === "LESSON"
          ? `${BASE_URL}/educational-content/content/${content._id}`
          : `${BASE_URL}/educational-content/exam/${content._id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [
      ...staticPages,
      ...stagePages,
      ...monthPages,
      ...contentPages,
    ];
  } catch {
    return staticPages;
  }
}
