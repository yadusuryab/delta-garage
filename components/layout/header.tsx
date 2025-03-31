"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "../brand/brand";
import SearchBar from "../utils/search-box";
import { useEffect, useState } from "react";
import CartButton from "../cart/cart-buttons/cart-count";
import { Button } from "../ui/button";
import { IconTruckDelivery } from "@tabler/icons-react";

const Header = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check if the current page is the homepage or product page
  const isHomePage = pathname === "/";
  const isProductPage = pathname.startsWith("/p/");

  // Hide search bar on specific pages
  const hideSearch =
    [
      "/my-cart",
      "/T&C",
      "/privacy-policy",
      "/about",
      "/checkout",
      "/contact",
      "/cookies",
      "/faq",
      "/order",
      "track-order",
    ].includes(pathname) ||
    pathname.startsWith("/p/") ||
    pathname.startsWith("/order/");

  // Hide search bar on scroll (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth <= 768 && isHomePage) {
        setIsScrolled(window.scrollY > 50);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage]);

  // Set `isClient` to true after the component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="flex top-0 justify-between z-50 w-full  md:px-16  bg-background h-14 items-center px-4">
      <div>
        <Link href="/">
          <Brand />
        </Link>
      </div>
      <div className="flex md:gap-3 gap-1">
        <CartButton />

        <SearchBar />
       <Link href='/track-order'> <Button size={'sm'}>Track Order</Button></Link>
      </div>
    </header>
  );
};

export default Header;
