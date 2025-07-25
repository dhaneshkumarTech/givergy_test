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
      variant="outline"
      onClick={openCart}
      className="cart-button relative gap-2 hover:bg-gradient-brand hover:text-white border-primary/80"
    >
      <ShoppingCart className="w-4 h-4" />
      Cart
      {totalItems > 0 && (
        <Badge 
          variant="default" 
          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
        >
          {totalItems}
        </Badge>
      )}
    </Button>
  );
};

export default CartButton;