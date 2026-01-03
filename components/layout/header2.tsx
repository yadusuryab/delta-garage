"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  ShoppingBagIcon 
} from "@heroicons/react/24/outline";
import Brand from "../brand/brand";
import CartButton from "../cart/cart-buttons/cart-count";
import { debounce } from "@/lib/utils";

// Memoized components for performance
const SearchIcon = memo(({ className }: { className?: string }) => (
  <MagnifyingGlassIcon className={className} />
));
SearchIcon.displayName = "SearchIcon";

const CloseIcon = memo(({ className }: { className?: string }) => (
  <XMarkIcon className={className} />
));
CloseIcon.displayName = "CloseIcon";

const Header2 = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hide on specific pages
  const hideElements = ["/checkout", "/order", "/my-cart"].some((path) =>
    pathname.startsWith(path)
  );

  // Debounced scroll handler
  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 10;
    if (scrolled !== isScrolled) {
      setIsScrolled(scrolled);
    }
  }, [isScrolled]);

  useEffect(() => {
    const debouncedScroll = debounce(handleScroll, 10);
    window.addEventListener("scroll", debouncedScroll, { passive: true });
    return () => window.removeEventListener("scroll", debouncedScroll);
  }, [handleScroll]);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("searchHistory");
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved).slice(0, 5)); // Keep only last 5
      } catch (e) {
        localStorage.removeItem("searchHistory");
      }
    }
  }, []);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };

    if (showSearch) {
      document.addEventListener("mousedown", handleClickOutside);
      // Focus input when search opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearch]);

  // Handle search with debouncing
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Save to search history
    const updatedHistory = [
      searchTerm,
      ...searchHistory.filter(term => term !== searchTerm)
    ].slice(0, 5);
    
    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));

    // Navigate
    router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm("");
    setShowSearch(false);
  }, [searchTerm, searchHistory, router]);

  // Quick search from history
  const handleQuickSearch = useCallback((term: string) => {
    router.push(`/products?search=${encodeURIComponent(term)}`);
    setShowSearch(false);
  }, [router]);

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      // Escape to close search
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  if (hideElements) {
    return (
      <>
      <header className="fixed top-0 w-full border-b z-50 bg-background h-16">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <Link href="/">
            <Brand  />
          </Link>
        </div>
       
      </header>
       <div className="h-18"></div></>
    );
  }

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-sm"
            : "bg-background"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Cart Button (Mobile) */}
            <div >
              <CartButton />
            </div>

            {/* Logo - Centered */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link href="/">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center"
                >
                  <Brand  />
                </motion.div>
              </Link>
            </div>

            {/* Right Side - Search & Cart */}
            <div className="flex items-center gap-4">
              {/* Search Button */}
              <motion.button
                onClick={() => setShowSearch(true)}
                aria-label="Search products"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SearchIcon className="w-5 h-5 text-muted-foreground" />
              </motion.button>

              {/* Cart Button (Desktop) */}
              
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              ref={searchRef}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute top-0 left-0 right-0 bg-background shadow-xl"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center gap-4">
                  <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for car parts, accessories..."
                        className="w-full px-4 py-3 pl-12 text-lg rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        autoComplete="off"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <SearchIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        <kbd className="hidden sm:inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">
                          ⌘K
                        </kbd>
                        <button
                          type="button"
                          onClick={() => setShowSearch(false)}
                          aria-label="Close search"
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        >
                          <CloseIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Search History */}
                {searchHistory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Recent Searches
                      </h3>
                      <button
                        onClick={clearHistory}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((term, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleQuickSearch(term)}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-2 text-sm bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
                        >
                          {term}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Quick Suggestions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8"
                >
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Popular Searches
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      "LED Lights",
                      "Spoilers",
                      "Car Mats",
                      "Steering Wheels",
                      "Fog Lamps",
                      "Car Audio",
                      "Seat Covers",
                      "Dash Cams"
                    ].map((suggestion, index) => (
                      <motion.button
                        key={suggestion}
                        onClick={() => handleQuickSearch(suggestion)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className="text-left p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-18" />
    </>
  );
};

export default memo(Header2);