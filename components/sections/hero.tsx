import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Poster from "@/public/slide1.jpg";
import Poster2 from "@/public/slide2.jpg";
import Poster3 from "@/public/slide3.jpg";
import Link from "next/link";
import Image from "next/image";

export function Hero() {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const slideData = [
    { title: "delta garage", src: Poster2.src },
    { title: "delta garage", src: Poster.src },
    { title: "delta garage", src: Poster3.src },
  ];

  React.useEffect(() => {
    if (!api) return;

    setCurrentIndex(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="p-6 rounded-3xl">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full relative h-[500px] rounded-3xl border md:max-h-full bg-black/80 overflow-hidden"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent >
          {slideData.map((slide, index) => (
            <CarouselItem key={index} >
              <Link href={"/products"}>
                <div className="relative">
                  <Image
                    width={1080}
                    height={1080}
                    className="w-full h-[500px]  opacity-40 object-cover"
                    alt={slide.title}
                    src={slide.src}
                    loading="eager"
                    decoding="sync"
                  />
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Slide Indicators */}

        <div className="absolute p-4  text-center w-full bottom-0">
        {/* <div className="w-full mb-5 mx-auto ">
          <h2 className="font-bold text-white text-2xl"> DELTA GARAGE</h2>
          <p className="font- text-secondary  mb-5">Best Collection of Automative Products.</p>
          <Link href={"/products"} className="flex justify-center">
            <Button
              variant={"secondary"}
            >
              Shop
            </Button>
          </Link>
        </div> */}
        <div className=" flex justify-center bg-background/80 backdrop-blur-lg saturate-200 rounded-full border w-fit mx-auto px-2 py-1 space-x-2 mt-2">
        {slideData.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              currentIndex === index
                ? "bg-primary w-4"
                : "bg-secondary "
            }`}
          />
        ))}
      </div>
        </div>
      </Carousel>
     
    </div>
  );
}
