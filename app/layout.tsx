import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { BookingProvider } from "@/components/booking";
import { BookingSheet } from "@/components/BookingSheet";
import { CartProvider } from "@/components/cart";
import { FloatingBook, Footer, Header } from "@/components/chrome";
import { MenuViewProvider } from "@/components/MenuView";
import { TakeawaySheet } from "@/components/TakeawaySheet";
import { seo } from "@/lib/content";
import "./globals.css";

const nunito = Nunito({
  subsets: ["cyrillic", "latin"],
  variable: "--font-nunito",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#f4efe6",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: seo["/"].title,
  description: seo["/"].description,
  openGraph: {
    title: seo["/"].title,
    description: seo["/"].description,
    images: ["/media/og.jpg"],
    locale: "ru_BY",
    type: "website",
  },
  other: {
    "color-scheme": "light only",
    "supported-color-schemes": "light",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={nunito.variable} style={{ colorScheme: "light only" }}>
      <body className="font-sans antialiased">
        <BookingProvider>
          <CartProvider>
            <MenuViewProvider>
              <Header />
              {children}
              <Footer />
              <FloatingBook />
              <BookingSheet />
              <TakeawaySheet />
            </MenuViewProvider>
          </CartProvider>
        </BookingProvider>
      </body>
    </html>
  );
}
