"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  XMarkIcon,
  Bars3Icon
} from "@heroicons/react/24/outline";
import Brand from "../brand/brand";
import CartButton from "../cart/cart-buttons/cart-count";

const Header2 = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Navigation items
  const navItems = [
    { name: "Products", href: "/products" },
    { name: "Categories", href: "/categories" },
    { name: "About", href: "/about" },
  ];

  // Hide elements on specific pages
  const hideElements = [
    "/checkout",
    "/order",
    "/my-cart",
  ].some(path => pathname.startsWith(path));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
      setIsMenuOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <header className={`fixed border-b top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? "bg-background/90 backdrop-blur-md shadow-sm" : "bg-background"
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Cart (mobile) and nav items (desktop) */}
          <div className="flex items-center">
            {/* Mobile cart button (left side) */}
            <CartButton/>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link href={item.href} key={item.name}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="text-sm font-medium text-muted-foreground hover:text-black transition-colors"
                  >
                    {item.name}
                  </motion.div>
                </Link>
              ))}
            </nav>
          </div>

          {/* Center - Logo */}
          <motion.div 
            className="flex-1 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center"
              >
                <Brand className="h-8" />
              </motion.div>
            </Link>
          </motion.div>

          {/* Right side - Menu (mobile) and all icons (desktop) */}
          <div className="flex items-center space-x-4">
            {!hideElements && (
              <>
                {/* Mobile view - Menu button */}
                <motion.button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 md:hidden"
                  aria-label="Menu"
                  whileTap={{ scale: 0.9 }}
                >
                  {isMenuOpen ? (
                    <XMarkIcon className="w-6 h-6 text-muted-foreground" />
                  ) : (
                    <Bars3Icon className="w-6 h-6 text-muted-foreground" />
                  )}
                </motion.button>

                {/* Desktop view - All icons */}
                <div className="hidden md:flex items-center space-x-4">
                <motion.form
                  onSubmit={handleSearch}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 px-4 py-2 text-sm border rounded-full focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-black text-white rounded-full"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4" />
                  </motion.button>
                </motion.form>

                  <Link href="/track-order" className="p-2">
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="flex items-center"
                    >
                      <TruckIcon className="w-5 h-5 text-muted-foreground mr-1" />
                      <span className="text-xs">Track</span>
                    </motion.div>
                  </Link>
                  
                  <CartButton/>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden md:hidden"
            >
              <div className="py-4 px-2 space-y-4 border-t">
                {/* Search Form */}
                <motion.form
                  onSubmit={handleSearch}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 px-4 py-2 text-sm border rounded-full focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-black text-white rounded-full"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4" />
                  </motion.button>
                </motion.form>

                {/* Track Order Button */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link href="/track-order" className="block">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm font-medium"
                    >
                      <TruckIcon className="w-5 h-5" />
                      Track Your Order
                    </motion.button>
                  </Link>
                </motion.div>

                {/* Navigation Links */}
                <div className="space-y-2 pt-2">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Link href={item.href} className="block">
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="px-2 py-3 text-sm font-medium border-b"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.name}
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header2;