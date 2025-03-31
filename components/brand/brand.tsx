import { site } from "@/lib/site-config";
import Logo from "@/public/logo.png";
import Image from "next/image";
import React from "react";

interface BrandProps {
  small?: boolean;
  className?: string;
}

const Brand: React.FC<BrandProps> = ({ small = false, className = "" }) => {
  return (
    <div className={className}>
      {/* <Image
        src={Logo}
        width={small ? 64 : 160}
        height={small ? 64 : 160}
        alt={site.name}
        className={`object-contain ${small ? "max-w-16" : "max-w-28"}`}
        priority
      /> */}
      <h2 className="font-bold">DELTA <span >GARAGE</span></h2>
    </div>
  );
};

export default Brand;
