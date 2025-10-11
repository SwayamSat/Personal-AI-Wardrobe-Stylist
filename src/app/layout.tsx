import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "WardrobeAI - Personal AI Wardrobe Stylist",
  description: "Transform your closet into a smart wardrobe with AI-powered outfit recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
