import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://seo-sensei.vercel.app'),
  title: "SEO Sensei - Free SEO Checker and Analyzer Tool | Website & GitHub Analysis",
  description: "SEO Sensei is a free SEO checker and analyzer tool that provides comprehensive SEO analysis, performance metrics, and AI-powered recommendations for websites and GitHub repositories.",
  keywords: ["SEO checker", "SEO analyzer", "free SEO tool", "website analysis", "SEO audit", "GitHub SEO", "SEO recommendations", "AI SEO tool", "PageSpeed insights", "SEO score"],
  authors: [{ name: "SEO Sensei Team" }],
  creator: "SEO Sensei",
  publisher: "SEO Sensei",
  openGraph: {
    title: "SEO Sensei - Free SEO Checker and Analyzer Tool",
    description: "Get comprehensive SEO analysis, performance metrics, and AI-powered recommendations for your website or GitHub repository",
    url: "https://seo-sensei.vercel.app",
    siteName: "SEO Sensei",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SEO Sensei - Free SEO Checker Tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Sensei - Free SEO Checker and Analyzer",
    description: "Get comprehensive SEO analysis with AI-powered recommendations",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://seo-sensei.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
