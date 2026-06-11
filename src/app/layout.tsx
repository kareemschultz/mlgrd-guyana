import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ChromeGate } from "@/components/site/chrome-gate";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { StructuredData } from "@/components/site/structured-data";
import { asset } from "@/lib/site";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mlgrd.gov.gy";
const TITLE = "Ministry of Local Government & Regional Development | Guyana";
const DESC =
  "The official portal of Guyana's Ministry of Local Government & Regional Development — directories of NDCs, RDCs and municipalities, services, laws & policies, and citizen support.";

export const metadata: Metadata = {
  title: { default: TITLE, template: "%s | MLGRD Guyana" },
  description: DESC,
  applicationName: "MLGRD Guyana",
  authors: [{ name: "Ministry of Local Government & Regional Development" }],
  keywords: [
    "Guyana",
    "Local Government",
    "Regional Development",
    "MLGRD",
    "NDC",
    "Neighbourhood Democratic Council",
    "Regional Democratic Council",
    "municipalities",
  ],
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: asset("/mlgrd-favicon.ico"), sizes: "16x16 32x32" },
      { url: asset("/mlgrd-icon.png"), type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: asset("/mlgrd-apple-icon.png"), type: "image/png", sizes: "512x512" }],
    shortcut: asset("/mlgrd-favicon.ico"),
  },
  openGraph: {
    type: "website",
    siteName: "MLGRD Guyana",
    title: TITLE,
    description: DESC,
    url: SITE_URL,
    locale: "en_GY",
    images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: "MLGRD Guyana" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: [`${SITE_URL}/og.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <StructuredData />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Providers>
          <ChromeGate>
            <SiteHeader />
          </ChromeGate>
          <main id="main" className="flex-1">
            {children}
          </main>
          <ChromeGate>
            <SiteFooter />
          </ChromeGate>
          <Toaster position="top-right" closeButton />
        </Providers>
      </body>
    </html>
  );
}
