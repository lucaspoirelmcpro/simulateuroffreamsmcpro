import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.meta.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.meta.description,
  keywords: [
    "AMS",
    "Athlete Management System",
    "MyCoach Pro",
    "gestion athlètes",
    "performance sportive",
    "data sport",
    "club football",
    "fédération sport",
    "dashboard BI sport",
    "wellness athlète",
  ],
  authors: [{ name: "MyCoach Pro", url: siteConfig.url }],
  creator: "MyCoach Pro",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.meta.title,
    description: siteConfig.meta.description,
    images: [
      {
        url: siteConfig.meta.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.meta.title,
    description: siteConfig.meta.description,
    images: [siteConfig.meta.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
