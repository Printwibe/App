import type React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ToastProvider } from "@/components/toast/toast-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PrintWibe - Custom Printed Products | T-Shirts, Mugs, Bottles & More",
  description:
    "Design and order custom printed products online. Upload your artwork on t-shirts, shirts, mugs, bottles and more. Premium quality, fast delivery, affordable prices. Create personalized gifts today!",
  keywords: [
    "custom prints",
    "personalized products",
    "custom t-shirts",
    "custom mugs",
    "custom bottles",
    "custom design",
    "print on demand",
    "personalized gifts",
    "custom apparel",
    "photo mugs",
    "custom shirts",
    "design your own",
    "bulk printing",
    "corporate gifts",
  ],
  authors: [{ name: "Rutik Kulkarni", url: "https://printwibe.com" }],
  creator: "Rutik Kulkarni",
  publisher: "PrintWibe",
  generator: "Next.js",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://printwibe.com",
    siteName: "PrintWibe",
    title: "PrintWibe - Custom Printed Products | Design Your Own Merch",
    description:
      "Upload your designs and create custom printed t-shirts, mugs, bottles & more. High-quality printing, fast delivery, and affordable prices. Start designing now!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PrintWibe - Custom Printed Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrintWibe - Custom Printed Products",
    description:
      "Design custom t-shirts, mugs, bottles & more. Upload your artwork and get premium quality prints delivered to your door.",
    images: ["/twitter-image.png"],
    creator: "@printwibe",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  alternates: {
    canonical: "/",
  },
  category: "e-commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PrintWibe",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://printwibe.com",
    logo: `${
      process.env.NEXT_PUBLIC_APP_URL || "https://printwibe.com"
    }/logo.png`,
    description:
      "Design and order custom printed products online. Premium quality t-shirts, mugs, bottles and more.",
    founder: {
      "@type": "Person",
      name: "Harish Chunarkar",
    },
    sameAs: ["https://instagram.com/print_wibe"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "contact@printwibe.com",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${
          process.env.NEXT_PUBLIC_APP_URL || "https://printwibe.com"
        }/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-LFK96SY6DJ"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-LFK96SY6DJ');
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
