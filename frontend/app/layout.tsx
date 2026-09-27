import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { UnitProvider } from "@/lib/UnitContext";
import { WeatherFXProvider } from "@/lib/WeatherFXContext";
import NavBar from "@/components/NavBar";
import ThermodynamicGrid from "@/components/ui/interactive-thermodynamic-grid";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Station — Weather Dashboard",
  description: "Current conditions, forecast, and search history",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <body className="relative min-h-screen antialiased" suppressHydrationWarning></body>
        <AuthProvider>
          <UnitProvider>
            <WeatherFXProvider>
              <ThermodynamicGrid resolution={16} coolingFactor={0.97} />
              <NavBar />
              <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
            </WeatherFXProvider>
          </UnitProvider>
        </AuthProvider>
      </body>
    </html>
  );
}