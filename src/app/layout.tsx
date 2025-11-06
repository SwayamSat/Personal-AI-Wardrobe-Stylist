import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import Footer from "@/components/Footer";
import WavePrism from "@/components/WavePrism";

export const metadata: Metadata = {
  title: "WardrobeAI - Personal AI Wardrobe Stylist",
  description: "Transform your closet into a smart wardrobe with AI-powered outfit recommendations",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="antialiased min-h-screen flex flex-col overflow-x-hidden">
        <ThemeProvider>
          <div className="fixed inset-0 -z-10 w-screen h-screen">
            <WavePrism 
              speed={0.2}
              beamThickness={0.2}
              distortion={0.25}
              xScale={0.5}
              yScale={0.3}
              glow={1.8}
              backgroundColor="transparent"
              className="w-full h-full"
            />
          </div>
          <main className="flex-1 relative z-10 w-full">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
