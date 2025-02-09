import { Providers } from "@/components/providers";
import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";
import { DM_Sans, Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const display = DM_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Rivvi - Conversational AI for healthcare",
  description:
    "Rivvi's human-like conversational AI enhances patient care, streamlines workflows, and improves outcomes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/login" waitlistUrl="/waitlist">
      <ViewTransitions>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${sans.variable} ${display.variable} antialiased font-sans`}
          >
            <Providers>
              <NuqsAdapter>{children}</NuqsAdapter>
            </Providers>
          </body>
        </html>
      </ViewTransitions>
    </ClerkProvider>
  );
}
