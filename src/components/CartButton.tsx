import React from 'react';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

const CartButton = () => {
  const { openCart, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <Button
      variant="ghost"
      onClick={openCart}
      className="cart-button relative group bg-white/80 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 h-12 shadow-lg hover:shadow-xl hover:bg-gradient-brand hover:text-white transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
        <span className="font-medium">Cart</span>
      </div>
      {totalItems > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center text-xs font-bold bg-red-500 text-white border-2 border-white rounded-full animate-pulse shadow-lg"
        >
          {totalItems}
        </Badge>
      )}
    </Button>
  );
};

export default CartButton;