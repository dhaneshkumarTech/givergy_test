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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled
          ? "bg-background/95 backdrop-blur-header shadow-header border-b border-border/50"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center shadow-glow transition-all duration-300 hover:shadow-glow hover:scale-105">
                <img src="" className="" />

                <span className="text-white font-bold text-lg">G</span>
              </div>
              {/* logo */}
              <span className="text-xl font-bold bg-gradient-brand bg-clip-text text-transparent">
                givergy
              </span>
            </div>
            
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-px h-6 bg-border"></div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  One World Rental
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <CartButton />
          </div>
        </div>

        <div className="flex sm:hidden items-center justify-center gap-2 mt-3 pt-3 border-t border-border/20">
          <CheckCircle className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">
            One World Rental
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;


