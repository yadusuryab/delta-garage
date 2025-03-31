import React from "react";
import Link from "next/link";

import { ChevronRight } from "lucide-react";
// Update this path as needed

const SHeading = ({
  title = "Get Top Deals on the Newest Products",
  description = "Visit our all our products",
  linkHref = "/products",
  nolink = false,
  buttonText = "View All Products",
}) => {
  return (
    <div className="my-4 w-full">
      <div className="text-center w-full">
        <h3 className="md:text-2xl text-2xl font-bold">{title}</h3>
        <p className="text-muted-foreground italic">
          {!nolink ? (
            <Link href={linkHref} className="flex items-center">
              <span>{description}</span> <ChevronRight />
            </Link>
          ) : (
            <span>{description}</span>
          )}
        </p>
      </div>
   
    </div>
  );
};

export default SHeading;
