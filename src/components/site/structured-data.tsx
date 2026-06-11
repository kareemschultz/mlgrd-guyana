import { ministry, asset } from "@/lib/site";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mlgrd.gov.gy";

/** JSON-LD structured data: GovernmentOrganization + WebSite. */
export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "GovernmentOrganization",
        "@id": `${SITE_URL}/#org`,
        name: ministry.name,
        alternateName: ministry.shortName,
        url: SITE_URL,
        logo: `${SITE_URL}${asset("/icon.png")}`,
        email: ministry.email,
        telephone: ministry.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Fort Street",
          addressLocality: "Georgetown",
          addressCountry: "GY",
        },
        areaServed: { "@type": "Country", name: "Guyana" },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: ministry.name,
        publisher: { "@id": `${SITE_URL}/#org` },
        inLanguage: "en-GY",
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
