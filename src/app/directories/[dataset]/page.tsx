import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/site/page-hero";
import { DatasetDirectory } from "@/components/directory/dataset-directory";
import { datasets, getDataset } from "@/lib/data/datasets";
import { datasetRecords } from "@/data/datasets";

type Params = { dataset: string };

export function generateStaticParams(): Params[] {
  return datasets.map((d) => ({ dataset: d.key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { dataset } = await params;
  const def = getDataset(dataset);
  if (!def) return { title: "Directory not found" };
  return {
    title: def.label,
    description: def.description,
    alternates: { canonical: `${def.route}/` },
  };
}

export default async function DatasetPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { dataset } = await params;
  const def = getDataset(dataset);
  if (!def) notFound();

  const records = datasetRecords[def.key] ?? [];

  return (
    <>
      <PageHero
        eyebrow="Directories"
        title={def.label}
        lead={def.description}
        crumbs={[{ label: "Directories" }, { label: def.label }]}
      />

      <section className="container-gov py-12 sm:py-16">
        <DatasetDirectory def={def} initial={records} />
      </section>
    </>
  );
}
