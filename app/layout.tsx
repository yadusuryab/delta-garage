import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { site } from "@/lib/site-config";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/layout/footer";
import Header2 from "@/components/layout/header2";
import OGimage from '@/public/og.png';
import { getAllProducts } from "@/lib/productQueries";

const inter = localFont({
  src: [
    {
      path: "../public/HelveticaNeueRoman.otf",
      weight: "normal",
      style: "normal",
    },
    {
      path: "../public/HelveticaNeueMedium.otf",
      weight: "bold",
      style: "bold",
    },
  ],
});

export const metadata: Metadata = {
  title: `${site.name} | Buy Quality Car Accessories at Affordable Prices`,
  description: "DeltaGarage – Kannur's trusted car accessories shop. Discover premium products like seat covers, lighting kits, infotainment systems, and more with fast nationwide delivery and unbeatable support.",
  keywords: [
    "DeltaGarage",
    "Car Accessories",
    "Kannur car accessories",
    "Online car accessories India",
    "Affordable car upgrades",
    "Vehicle styling Kerala",
    "Seat covers",
    "Fog lamps",
    "Infotainment system",
    "Auto accessories store"
  ],
  openGraph: {
    title: `${site.name} | Buy Quality Car Accessories at Affordable Prices`,
    description: "DeltaGarage – Kannur's trusted car accessories shop. Premium products with fast delivery and unmatched service.",
    url: "https://deltagarage.in",
    siteName: site.name,
    images: [
      {
        url: OGimage.src,
        width: 1200,
        height: 630,
        alt: "DeltaGarage - Car Accessories",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Buy Car Accessories Online`,
    description: "Shop high-quality car accessories from DeltaGarage with Cash on Delivery across India.",
    images: [OGimage.src],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://deltagarage.in",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/shortcut-icon.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

async function generateJsonLdProducts() {
  const products = await getAllProducts();
  if (!products) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "Product",
      position: index + 1,
      name: product.name,
      description: product.description,
      url: `https://deltagarage.in/${product.category?.slug?.current}/${product._id}`,
      image: product.images?.[0]?.asset?.url,
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: product.offerPrice || product.price,
        availability: product.soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: "DeltaGarage",
        },
      },
    })),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdProducts = await generateJsonLdProducts();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {jsonLdProducts && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProducts) }}
          />
        )}
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <Header2 />
          <div className="min-h-screen pt-16 pb-10">{children}</div>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
