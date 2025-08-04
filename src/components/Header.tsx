import React, { useEffect, useState } from "react";
import CartButton from "@/components/CartButton";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b",
        isScrolled
          ? "bg-white border-primary/10 shadow-sm"
          : "bg-gradient-subtle/80 backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="hidden md:flex items-center justify-between">
          {/* Left spacer for balance */}
          <div className="flex-1"></div>
          
          {/* Centered Logos */}
          <div className="flex items-center justify-center">
            <div className="w-46 h-12 flex items-center justify-center transition-all duration-300  hover:drop-shadow-lg rounded-lg p-2">
              <a href="https://www.givergy.com/us/" className="w-full h-full">
                <img src="/products/givergy2.png" alt="Givergy Logo" className="object-contain h-full w-full" />
              </a>
            </div>
            <div className="w-8 h-8 flex items-center justify-center transition-all duration-300  hover:drop-shadow-lg rounded-lg p-2">
                <img src="/products/cross.png" alt="Partner Logo" className="object-contain h-full w-full" />
            </div>

            <div className="w-48 h-12 flex items-center justify-center transition-all duration-300  hover:drop-shadow-lg rounded-lg p-2">
              <a href="https://oneworldrental.com/" className="w-full h-full">
                <img src="/products/owr.png" alt="Partner Logo" className="object-contain h-full w-full" />
              </a>
            </div>
          </div>

          {/* Right aligned cart button */}
          <div className="flex-1 flex justify-end">
            <CartButton />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex md:hidden items-center justify-between">
          {/* Mobile Logos */}
          <div className="flex items-center">
            <div className="w-24 h-12 flex items-center justify-center transition-all duration-300 hover:scale-105">
              <a href="https://www.givergy.com/us/">
                <img src="/products/givergy2.png" alt="Givergy Logo" className="object-contain h-full w-full" />
              </a>
            </div>
            <div className="w-8 h-8 flex items-center justify-center transition-all duration-300  hover:drop-shadow-lg rounded-lg p-2">
                <img src="/products/cross.png" alt="Partner Logo" className="object-contain h-full w-full" />
            </div>
            <div className="w-28 h-12 flex items-center justify-center transition-all duration-300 hover:scale-105">
              <a href="https://oneworldrental.com/">
                <img src="/products/owr.png" alt="Partner Logo" className="object-contain h-full w-full" />
              </a>
            </div>
          </div>

          <CartButton />
        </div>
      </div>
    </header>
  );
};

export default Header;


