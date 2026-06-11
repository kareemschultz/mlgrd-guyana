import type { MetadataRoute } from "next";
import ndcs from "@/data/ndcs.json";
import services from "@/data/services.json";
import laws from "@/data/laws.json";

export const dynamic = "force-static";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mlgrd.gov.gy";

const staticRoutes = [
  "",
  "/about",
  "/services",
  "/laws-policies",
  "/ndcs",
  "/rdcs",
  "/municipalities",
  "/cdcs",
  "/news",
  "/gallery",
  "/updates",
  "/contact",
  "/faq",
  "/ministers-desk",
  "/helpdesk",
  "/vacancies",
  "/privacy",
  "/accessibility",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}/`.replace(/\/+$/, "/"),
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  });

  return [
    ...staticRoutes.map((r) => entry(r, r === "" ? 1 : 0.8)),
    ...services.map((s) => entry(`/services/${s.slug}`, 0.7)),
    ...laws.map((l) => entry(`/laws-policies/${l.slug}`, 0.6)),
    ...ndcs.map((n) => entry(`/ndcs/${n.slug}`, 0.5)),
  ];
}
