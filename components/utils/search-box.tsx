"use client";
import React, { useState, useEffect } from "react";
import { Blocks, BlocksIcon, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"; // Import necessary Shadcn components
import CategoriesHomeList from "../categories/categories-home-list";

interface SearchBarProps {
  defaultValue?: string;
  cat?:boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ defaultValue = "", cat = false }) => {
  const [search, setSearch] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false); // State to control sheet open/close
  const router = useRouter();

  useEffect(() => setSearch(defaultValue), [defaultValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/products?search=${search}`);
      setIsSheetOpen(false); // Close the sheet after search
    }
  };

  const handleSearchClick = () => {
    if (search.trim()) {
      router.push(`/products?search=${search}`);
      setIsSheetOpen(false); // Close the sheet after search
    }
  };

  return (
    <div>
      {/* Trigger Button for Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <div className="w-full">
        <SheetTrigger asChild>
         {!cat ? <Button variant="ghost" size={"icon"}>
            <Search />
          </Button> :  <Button  className={`h-20  rounded-2xl flex justify-between w-full   border text-xl font-semibold  `} variant={'outline'}>
                <span>All Categories</span> <span><BlocksIcon/></span>
              </Button>}
        </SheetTrigger>
        </div>
        {/* Sheet Content with Input */}
        <SheetContent className="flex flex-col p-4 !w-full">
          <SheetHeader className="text-left">
            <SheetTitle>Search Car Accessories</SheetTitle>
            <SheetDescription>
              Enter your search below to find the best for your car.
            </SheetDescription>
          </SheetHeader>

          <div className="flex items-center relative">
            <input
              placeholder="Search for car accessories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="border-0 outline-none relative bg-secondary font-semibold w-full px-3 py-2 rounded-full"
            />

            {/* Button to trigger the search */}
            <div className="absolute right-2">
              <Link href={search ? `/products?search=${search}` : "/products"}>
                <Button variant={"default"} size={"icon"} onClick={handleSearchClick}>
                  <Search />
                </Button>
              </Link>
            </div>
          </div>

          {/* Categories List */}
          <CategoriesHomeList
            flex_col={true}
            className={"!p-0"}
            buttonOnclick={()=>setIsSheetOpen(false)}
            buttonClass={
              "text-xl bg-background text-foreground p-0 w-full !text-start border-b-2"
            }
            heading={true}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SearchBar;