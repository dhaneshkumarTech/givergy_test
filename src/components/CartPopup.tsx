import React from 'react';
import { useCartStore } from '@/store/cart';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartPopup = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalItems, getTotalPrice, startDate, endDate } = useCartStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!startDate || !endDate) {
      // Scroll to top to show date fields and close cart
      closeCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Trigger validation state in parent component
      window.dispatchEvent(new CustomEvent('show-date-validation'));
      return;
    }
    closeCart();
    navigate('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-[400px] sm:w-[540px] p-8" >
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">Shopping Cart</SheetTitle>
            <Badge variant="secondary" className="px-3 py-1 bg-gradient-brand text-primary-foreground">
              {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Your cart is empty</h3>
                <p className="text-muted-foreground">Add some items to get started</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-4 py-6 overflow-y-auto">
                {items.map((item) => (
                  <Card key={item.id} className="group">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <Badge variant="outline" className="text-xs mb-1 bg-gradient-brand text-primary-foreground">
                                {item.category}
                              </Badge>
                              <h4 className="font-semibold text-sm leading-tight">
                                {item.title}
                              </h4>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-bold text-primary">
                                ${(parseFloat(item.price.replace('From: $', '')) * item.quantity).toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.price} each
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${getTotalPrice().toFixed(2)}</span>
                </div>
                
                <Button 
                  className="w-full h-12 bg-gradient-brand text-primary-foreground"
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartPopup;