import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Nunito } from "next/font/google";
import { BookingProvider } from "@/components/booking";
import { BookingSheet } from "@/components/BookingSheet";
import { CartProvider } from "@/components/cart";
import { FloatingBook, Footer, Header } from "@/components/chrome";
import { LocaleHead } from "@/components/LocaleHead";
import { MenuViewProvider } from "@/components/MenuView";
import { TakeawaySheet } from "@/components/TakeawaySheet";
import { seo } from "@/lib/content";
import { LocaleProvider } from "@/lib/locale";
import { ThemeProvider } from "@/lib/theme";
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
  colorScheme: "light dark",
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
    "color-scheme": "light dark",
    "supported-color-schemes": "light dark",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={nunito.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Script id="umi-theme-boot" strategy="beforeInteractive">
          {`(function(){try{var m=document.cookie.match(/(?:^|; )umi_theme=([^;]*)/);var t=m?decodeURIComponent(m[1]):"";if(t!=="dark"&&t!=="light"){t=localStorage.getItem("umi_theme")||""}if(t==="dark"){document.documentElement.setAttribute("data-theme","dark");document.documentElement.style.colorScheme="dark"}}catch(e){}})();`}
        </Script>
        <ThemeProvider>
          <LocaleProvider>
            <LocaleHead />
            <BookingProvider>
              <CartProvider>
                <MenuViewProvider>
                  <div className="flex min-h-dvh flex-col">
                    <Header />
                    {children}
                    <Footer />
                  </div>
                  <FloatingBook />
                  <BookingSheet />
                  <TakeawaySheet />
                </MenuViewProvider>
              </CartProvider>
            </BookingProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
