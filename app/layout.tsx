import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://omnitools.app"),
  title: {
    default: "OmniTools — Free Online Tools for Everyday Tasks",
    template: "%s | OmniTools",
  },
  description:
    "Compress files, convert images, merge PDFs, and solve everyday calculations — fast, free, and 100% private in your browser.",
  keywords: [
    "online tools",
    "pdf tools",
    "merge pdf",
    "compress pdf",
    "image compressor",
    "percentage calculator",
    "unit converter",
    "free utilities",
    "privacy focused tools",
  ],
  authors: [{ name: "OmniTools Team" }],
  creator: "OmniTools",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://omnitools.app",
    title: "OmniTools — Free Online Tools for Everyday Tasks",
    description:
      "Compress files, convert images, merge PDFs, and solve calculations with zero server uploads.",
    siteName: "OmniTools",
  },
  twitter: {
    card: "summary_large_image",
    title: "OmniTools — Free Online Productivity Toolbox",
    description: "30+ free tools for PDF, image, text, and calculations. 100% private.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
