import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari, Noto_Sans_Telugu, Noto_Sans_Tamil, Noto_Sans_Kannada, Noto_Sans_Bengali, Noto_Sans_Gujarati } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Indic script fonts for proper rendering
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["400", "500", "600", "700"], variable: "--font-devanagari" });
const telugu = Noto_Sans_Telugu({ subsets: ["telugu"], weight: ["400", "500", "600", "700"], variable: "--font-telugu" });
const tamil = Noto_Sans_Tamil({ subsets: ["tamil"], weight: ["400", "500", "600", "700"], variable: "--font-tamil" });
const kannada = Noto_Sans_Kannada({ subsets: ["kannada"], weight: ["400", "500", "600", "700"], variable: "--font-kannada" });
const bengali = Noto_Sans_Bengali({ subsets: ["bengali"], weight: ["400", "500", "600", "700"], variable: "--font-bengali" });
const gujarati = Noto_Sans_Gujarati({ subsets: ["gujarati"], weight: ["400", "500", "600", "700"], variable: "--font-gujarati" });

export const metadata: Metadata = {
  title: "AgriFlow",
  description: "Agricultural Supply Chain Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${devanagari.variable} ${telugu.variable} ${tamil.variable} ${kannada.variable} ${bengali.variable} ${gujarati.variable} ${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
