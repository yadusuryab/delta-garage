"use client";

import { getAllCategories } from "@/lib/productQueries";
import { cn } from "@/lib/utils";
import {
  IconChevronDown,
  IconChevronUp,
  IconBulb,
  IconCar,
  IconBrightnessUp,
  IconArmchair,
  IconSpeakerphone,
  IconBrandVolkswagen,
  IconManualGearbox
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Splash from "../utils/splash";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function CategoryDisplay() {
  const [categories, setCategories] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data: any = await getAllCategories();
        if (!data || !Array.isArray(data))
          throw new Error("Invalid product data");
        setCategories(data);
      } catch (err) {
        setError("Failed to fetch categories.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (error) toast(error);
  }, [error]);

  if (loading) return <Splash />;

  if (!categories || categories.length === 0) {
    return <p className="font-bold text-sm p-4">Categories not found.</p>;
  }
  const categoryFeatures = categories.map((category) => {
    const categoryIconMap: any = {
      "Lights & Flashers": <IconBulb key="lights" />,
      "Fog lamps": <IconBrightnessUp key="fog" />,
      "Splitters, Skirtings & Diffusers": <IconCar key="bodykit" />,
      "Spoilers": <IconCar key="spoiler" />,
      "Car Interiors": <IconArmchair key="interior" />,
      "Horns, Sirens & Air Intakes": <IconSpeakerphone key="horn" />,
      "German Car Accessories": <IconBrandVolkswagen key="german" />,
      "Gear Knobs, Hubs & Steerings": <IconManualGearbox key="steering" />
    };
  
    const fallbackIcon = <IconCar key="car" />;
  
    return {
      title: category?.name || 'deltagarage',
      description: category.description || `Explore our ${category?.name || 'deltagarage'} collection`,
      icon: categoryIconMap[category?.name || 'dg'] || fallbackIcon,
      slug: category.slug.current,
      imageUrl: category.image?.asset?.url || null,
    };
  });

  const visibleCategories = showAll ? categoryFeatures : categoryFeatures.slice(0, 1);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 mt-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:hidden">
        {visibleCategories.map((feature, index) => (
          <Link href={`/products?category=${feature.slug}`} key={feature.slug}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Feature 
                {...feature} 
                index={index}
                showBorder={index < (showAll ? categoryFeatures.length - 1 : 2)}
              />
            </motion.div>
          </Link>
        ))}

        <AnimatePresence>
          {categoryFeatures.length > 3 && (
            <motion.div
              className="col-span-1 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.button
                onClick={() => setShowAll(!showAll)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-4 px-10",
                  "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100",
                  "transition-colors duration-200"
                )}
                whileTap={{ scale: 0.95 }}
              >
                {showAll ? (
                  <>
                    <IconChevronUp className="w-5 h-5" />
                    <span>Show Less</span>
                  </>
                ) : (
                  <>
                    <IconChevronDown className="w-5 h-5" />
                    <span>Show All ({categoryFeatures.length})</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 hidden md:grid">
        {categoryFeatures.map((feature, index) => (
          <Link href={`/products?category=${feature.slug}`} key={feature.slug}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Feature 
                {...feature} 
                index={index}
                showBorder={index < (showAll ? categoryFeatures.length - 1 : 2)}
              />
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
  showBorder = true,
  imageUrl
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
  showBorder?: boolean;
  imageUrl?: string | null;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col border-b dark:border-neutral-800 py-10 relative group/feature overflow-hidden",
        "md:border-b-0",
        index % 4 === 3 ? "md:border-r-0" : "md:border-r dark:border-neutral-800",
        index < 4 && "md:border-b dark:border-neutral-800",
        (index === 0 || index === 4) && "md:border-l dark:border-neutral-800",
        !showBorder && "border-b-0",
        "h-full min-h-[250px]"
      )}
    >
      {/* Background Image with overlay */}
      {imageUrl && (
        <>
          <div className="absolute inset-0 z-0">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover/feature:scale-105"
              quality={80}
            />
          </div>
          <div className="absolute inset-0 z-0 bg-black/40 group-hover/feature:bg-black/50 transition-colors duration-300" />
        </>
      )}

      {/* Content */}
      <div className="mb-4 relative z-10 px-10 text-white">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-white/70 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 truncate transition duration-200 inline-block text-white">
          {title}
        </span>
      </div>
      <p className="text-sm text-white/80 max-w-xs relative z-10 px-10 truncate">
        {description}
      </p>

      {/* Hover effects */}
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-black/30 to-transparent pointer-events-none z-0" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-black/30 to-transparent pointer-events-none z-0" />
      )}
    </div>
  );
};