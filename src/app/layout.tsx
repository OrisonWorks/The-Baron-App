import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/context/cart-context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-display" });

export const viewport: Viewport = { themeColor: "#0a0a0b" };

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"
  ),
  title: "The Baron — Premium Watches, Gadgets & Accessories in Lusaka",
  description:
    "Watches (Fossil, Invicta, Timex, Naviforce, Curren, Casio), phones, headphones, earphones, phone accessories, body care and clothing in Lusaka. Order on WhatsApp +260 974 128 784.",
  icons: { icon: "/brand/crest.png", apple: "/brand/crest.png" },
  openGraph: { images: ["/brand/logo.jpg"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink">Skip to content</a>
        <CartProvider>
          {children}
          <Toaster position="bottom-center" theme="dark" richColors />
        </CartProvider>
      </body>
    </html>
  );
}
