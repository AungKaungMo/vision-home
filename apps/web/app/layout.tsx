import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import {
  DM_Serif_Display,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "../assets/css/global.css";
import { Providers } from "@/app/providers";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const displayFont = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-face",
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body-face",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
});

export const metadata: Metadata = {
  title: "VisionHome",
  description: "Design a home that feels like you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(displayFont.variable, bodyFont.variable, monoFont.variable)}
    >
      <body>
        <ClerkProvider>
          <Providers>{children}</Providers>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
