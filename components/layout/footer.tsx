"use client";

import * as React from "react";
import { site } from "@/lib/site-config";
import Link from "next/link";

function Footer() {
  const [isChatOpen, setIsChatOpen] = React.useState<string>();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 font-semibold">
          <div className="">
            <h3 className="mb-2 font-semibold">Resources</h3>
            <nav className="space-y-2 text-muted-foreground text-sm">
              <Link
                href="/"
                className="block transition-colors hover:text-main"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="block transition-colors hover:text-main"
              >
                About Us
              </Link>

              <Link
                href="/products"
                className="block transition-colors hover:text-main"
              >
                Products
              </Link>
              <Link
                href="/contact"
                className="block transition-colors hover:text-main"
              >
                Contact
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Contact</h3>
            <address className="space-y-2 text-muted-foreground text-sm not-italic">
              <p>{site.address}</p>
              {/* <p>Tech City, TC 12345</p> */}
              <p>Phone: {site.phone}</p>
            </address>
          </div>
          <div className="relative">
            <h3 className="mb-2 font-semibold">Social</h3>
            <div className=" grid text-muted-foreground">
              <Link href={`https://wa.me/${site.phone}?text=Hi`}>
                <p>Whatsapp</p>
              </Link>

              <Link href={`https://instagram.com/${site.instagram}`}>
                <p>Instagram</p>
              </Link>
              {/* <Link href={`https://www.facebook.com/profile.php?id=61553325001995#`}>
                     
                     <p>Facebook</p>
                 
                 </Link> */}
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
  <div className="flex flex-col items-center gap-6 text-sm text-muted-foreground md:flex-row md:justify-between">
    <p>© {currentYear} {site.name}. All rights reserved.</p>
    
    <div className="flex flex-wrap justify-center gap-4">
      <Link href="/privacy-policy" className="hover:text-main">
        Privacy
      </Link>
      <span className="text-gray-300">•</span>
      <Link href="/terms" className="hover:text-main">
        Terms
      </Link>
      <span className="text-gray-300">•</span>
      <Link href="/cookies" className="hover:text-main">
        Cookies
      </Link>
    </div>
    
    <p>
      Wesbite Built by{" "}
      <Link 
        href="https://myshopigo.shop" 
        className="text-main font-semibold  "
        target="_blank"
      >
        Shopigo
      </Link>
    </p>
  </div>
</div>
      </div>
    </footer>
  );
}

export { Footer };
