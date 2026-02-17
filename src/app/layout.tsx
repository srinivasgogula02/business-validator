import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "OnEasy Business Validator | AI-Powered Business Idea Validation",
  description:
    "Validate your business idea with an AI consultant. Get market analysis, competitor insights, and a pitch-ready validation report — all through a natural conversation.",
  keywords: [
    "business validation",
    "startup",
    "market analysis",
    "AI consultant",
    "pitch deck",
    "OnEasy",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${poppins.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
