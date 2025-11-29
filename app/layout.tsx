import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ego Index - Check Your Social Media Ego",
  description: "Analyze your Twitter/X account and get your ego-to-value ratio score. See if you're providing value or just main character energy.",
  openGraph: {
    title: "Ego Index - Check Your Social Media Ego",
    description: "Score your social media profile for ego-to-value ratio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ego Index",
    description: "Check your ego score",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
