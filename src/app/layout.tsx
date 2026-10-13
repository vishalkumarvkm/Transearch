import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://transearchai.com"),
  title: {
    default: "TRANSEARCH International — Executive AI Voice Agents",
    template: "%s | TRANSEARCH International"
  },
  description: "Global Executive Search & Leadership Advisory AI Voice Platform. Confidential executive briefings and talent advisory powered by Sara.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  keywords: [
    "TRANSEARCH International",
    "Executive Search AI",
    "Sara AI Voice Agent",
    "Executive Search Consultant",
    "Leadership Advisory",
    "AI Voice Interview",
    "C-Suite Talent Advisory"
  ],
  authors: [{ name: "TRANSEARCH International" }]
};

export const viewport: Viewport = {
  themeColor: "#0D1B2A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[#F4F5F7] text-[#0D1B2A]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
