"use client";

import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import Image from "next/image";
import { urlFor } from "@/sanityClient";

const ProductCarousel = ({
  images,
  productName,
}: {
  images: any[];
  productName: string;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    if (!carouselApi) return;

    const handleSelect = () => setActiveIndex(carouselApi.selectedScrollSnap());

    carouselApi.on("select", handleSelect);

    return () => {
      carouselApi.off("select", handleSelect);
    };
  }, [carouselApi]);

  // Function to change active image when clicking thumbnails
  const handleThumbnailClick = (index: number) => {
    if (!carouselApi) return;
    carouselApi.scrollTo(index);
    setActiveIndex(index);
  };

  return (
    <div className="w-full md:flex gap-2 flex-row-reverse md:items-center">
      {/* Main Carousel */}
      <Carousel className="w-full rounded-lg relative" setApi={setCarouselApi}>
        <CarouselContent>
          {images.length > 0 ? (
            images.map((image, index) => (
              <CarouselItem key={index}>
                <Image
                  src={urlFor(image.asset.url).url()}
                  alt={productName}
                  width={1200}
                  height={800}
                  className="h-[350px] md:h-[650px] w-full object-cover rounded-lg"
                />
              </CarouselItem>
            ))
          ) : (
            <CarouselItem>
              <Image
                src="/default-product.jpg"
                alt="Default Product"
                width={1200}
                height={800}
                className="h-[350px] md:h-[650px] w-full object-cover rounded-lg"
              />
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-background bg-opacity-50 text-foreground rounded-full p-2 cursor-pointer">
          &#8592;
        </CarouselPrevious>
        <CarouselNext className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-background bg-opacity-50 text-foreground rounded-full p-2 cursor-pointer">
          &#8594;
        </CarouselNext>
      </Carousel>

      {/* Thumbnails */}
      <div className="flex md:grid justify-center gap-2 mt-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(index)}
            className={`w-16 h-16 border-2 rounded-md overflow-hidden ${
              activeIndex === index ? "border-primary" : "border-transparent"
            }`}
          >
            <Image
              src={urlFor(image.asset.url).url()}
              alt={`${productName} thumbnail`}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;
