import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { seedPosts } from "@/lib/data/seed";
import { ArticleView } from "@/components/news/article-view";

type Params = { slug: string };

const published = () => seedPosts.filter((p) => p.status === "published");

export function generateStaticParams(): Params[] {
  return published().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = seedPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Article not found" };

  const description = post.excerpt || post.body.slice(0, 160);
  return {
    title: post.title,
    description,
    alternates: { canonical: `/news/${post.slug}/` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: post.date,
      tags: post.tags,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = seedPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return <ArticleView initial={post} />;
}
