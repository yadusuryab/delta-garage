import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { urlFor } from "@/sanityClient";
import { Badge } from "@/components/ui/badge";
import { site } from "@/lib/site-config";

import ProductCarousel from "@/components/product/product-carousel";

import SHeading from "@/components/utils/section-heading";
import AddToCartButton from "@/components/cart/cart-buttons/add-to-cart";
import { getShoeById } from "@/lib/vehicleQueries";

interface ProductProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getShoeById(resolvedParams.id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for does not exist.",
    };
  }

  const { name, price, images } = product;
  const ogImage = urlFor(images[0]?.asset.url).url();
  const ogDescription = `Check out the ${name} priced at ₹${price.toLocaleString()}. Available now!`;

  return {
    title: `${name} - Product Details`,
    description: ogDescription,
    openGraph: {
      title: `${name} - Product Details`,
      description: ogDescription,
      images: [{ url: ogImage, alt: name, width: 800, height: 600 }],
    },
  };
}

export default async function ProductPage({ params }: any) {
  const resolvedParams = await params;
  const product: any = await getShoeById(resolvedParams.id);

  if (!product) return notFound();

  const {
    name,
    category,
    brand,
    compatibility,
    features,
    images,
    description,
    price,
    offerPrice,
    soldOut,
  } = product;
 
  return (
    <div className="md:mx-28 mx-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Carousel */}
        <ProductCarousel images={images} productName={name} />

        {/* Product Details */}
        <div className="space-y-4">
          <div>
            <p className="uppercase text-md font-semibold text-muted-foreground">
              {category?.name || site.name}
            </p>
            <h2 className="text-lg md:text-2xl font-bold uppercase">{name}</h2>
          </div>

          <div className="flex gap-4 items-center">
            <Badge className="rounded-md">
              {category?.name?.toUpperCase()}
            </Badge>
            {brand && (
              <Badge className="rounded-md" variant={"secondary"}>
                {brand.toUpperCase()}
              </Badge>
            )}
          </div>

          {/* Price Section */}
          <div className="col-span-2">
            {offerPrice ? (
              <div className="flex items-center gap-4">
                <p className="font-bold text-xl">
                  ₹{new Intl.NumberFormat("en-IN").format(offerPrice)}
                </p>
                <p className="text-lg font-extrabold text-muted-foreground line-through">
                  ₹{new Intl.NumberFormat("en-IN").format(price)}
                </p>
                <span className="text-sm font-bold text-green-600 ml-2">
                  {Math.round((price - offerPrice) / price) * 100} % OFF
                </span>
              </div>
            ) : (
              <p className="font-bold text-xl">
                ₹{new Intl.NumberFormat("en-IN").format(price)}
              </p>
            )}
          </div>

          <div>
            {soldOut ? (
              <Button className="w-full rounded-sm" disabled>
                Sold Out
              </Button>
            ) : (
              <AddToCartButton product={product} />
            )}
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2">
              <SHeading
                title="About This Product"
                description={description}
                nolink={true}
              />
            </div>
            
            {compatibility && (
              <div className="col-span-2">
                <p className="font-semibold text-muted-foreground">Compatibility</p>
                <p>{compatibility}</p>
              </div>
            )}
            
            {features && features.length > 0 && (
              <div className="col-span-2">
                <p className="font-semibold text-muted-foreground">Features</p>
                <ul className="list-disc pl-5">
                  {features.map((feature: string, index: number) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <p className="font-semibold text-muted-foreground">Brand</p>
              <p>{brand || "N/A"}</p>
            </div>
            
            <div>
              <p className="font-semibold text-muted-foreground">Price</p>
              <p>
                {offerPrice ? (
                  <>
                    ₹{new Intl.NumberFormat("en-IN").format(offerPrice)}{" "}
                    <span className="text-muted-foreground line-through">
                      ₹{new Intl.NumberFormat("en-IN").format(price)}
                    </span>
                  </>
                ) : (
                  `₹${new Intl.NumberFormat("en-IN").format(price)}`
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}