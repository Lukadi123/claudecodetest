import type { Metadata } from "next";
import "./globals.css";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { AuthProvider } from "@/lib/context/AuthContext";

export const metadata: Metadata = {
  title: "NewsPulse - 24-Hour News Aggregator",
  description: "Stay updated with the latest news from North Macedonia, Balkans, AI, and Tech. Trending topics from Reddit and X.com.",
  keywords: ["news", "North Macedonia", "Balkans", "AI", "technology", "trending"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <BackgroundPaths />
        <div className="relative z-10">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
