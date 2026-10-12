import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { getSiteUrl } from "@/lib/site-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050506" },
    { media: "(prefers-color-scheme: light)", color: "#f4f4f1" },
  ],
};

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getSiteUrl();
  let canonicalUrl: string | undefined;

  if (configuredSiteUrl) {
    try {
      const parsedUrl = new URL(configuredSiteUrl);
      if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
        canonicalUrl = parsedUrl.origin;
      }
    } catch {
      canonicalUrl = undefined;
    }
  }

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title: "Helyx IT — Websites, SaaS Products & Interactive Digital Experiences",
    description:
      "Helyx IT designs and develops distinctive websites, interactive digital experiences and reliable SaaS products for ambitious businesses.",
    applicationName: "Helyx IT",
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      type: "website",
      siteName: "Helyx IT",
      title: "Helyx IT — Websites, SaaS Products & Interactive Digital Experiences",
      description:
        "Beautiful on the surface. Intelligent underneath. Reliable by design.",
    },
    twitter: {
      card: "summary_large_image",
      title: "Helyx IT — Websites, SaaS Products & Interactive Digital Experiences",
      description:
        "Distinctive websites, interactive digital experiences and reliable SaaS products.",
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
        {/* WARNING FOR AGENT: DO NOT REMOVE THIS SCRIPT */}
        <Script src="https://cdn.jsdelivr.net/gh/IdeavoAI/ideavo-scripts@latest/scripts/ideavo.min.js" />
      </body>
    </html>
  );
}
