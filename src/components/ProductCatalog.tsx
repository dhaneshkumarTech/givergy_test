import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart";
import { ShoppingCart, Package, Tablet, Award, Clock, CheckCircle, Plus, Minus } from "lucide-react";

interface ProductCatalogProps {
  onRentNow: () => void;
}

const ProductCatalog = ({ onRentNow }: ProductCatalogProps) => {
  const { addItem, getTotalItems } = useCartStore();
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  const getQuantity = (id: number) => quantities[id] || 1;
  
  const updateQuantity = (id: number, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, quantity)
    }));
  };

  const createFlyingAnimation = (event: React.MouseEvent, item: any) => {
    const button = event.currentTarget as HTMLButtonElement;
    const card = button.closest('.product-card') as HTMLElement;
    const productImg = card?.querySelector('.product-image') as HTMLImageElement;
    const cartButton = document.querySelector('.cart-button') as HTMLElement;
    
    if (!productImg || !cartButton) return;

    // Create flying image
    const flyingImg = productImg.cloneNode(true) as HTMLImageElement;
    const productRect = productImg.getBoundingClientRect();
    const cartRect = cartButton.getBoundingClientRect();
    
    // Style the flying image
    flyingImg.style.position = 'fixed';
    flyingImg.style.top = `${productRect.top}px`;
    flyingImg.style.left = `${productRect.left}px`;
    flyingImg.style.width = `${productRect.width}px`;
    flyingImg.style.height = `${productRect.height}px`;
    flyingImg.style.zIndex = '9999';
    flyingImg.style.transition = 'all 0.8s cubic-bezier(0.2, 1, 0.3, 1)';
    flyingImg.style.pointerEvents = 'none';
    flyingImg.className = 'flying-product-image';
    
    document.body.appendChild(flyingImg);
    
    // Animate to cart
    requestAnimationFrame(() => {
      flyingImg.style.top = `${cartRect.top + cartRect.height / 2 - 45}px`;
      flyingImg.style.left = `${cartRect.left + cartRect.width / 2 - 45}px`;
      flyingImg.style.width = '90px';
      flyingImg.style.height = '90px';
      flyingImg.style.opacity = '0.9';
      flyingImg.style.transform = 'scale(0.5)';
    });
    
    // Clean up after animation
    setTimeout(() => {
      document.body.removeChild(flyingImg);
      // Add item after animation completes
      const quantity = getQuantity(item.id);
      addItem({
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        category: item.category
      }, quantity);
    }, 800);
  };
  const bundles = [
    {
      id: 1,
      title: "iPad 10.2 7th Gen WiFi and Stand Reader",
      description: "iPad 10.2 7th gen WiFi with OpenReads software pre-loaded for contactless silent bidding and event management. Hub includes carry cases, strap, and cables.",
      features: ["iPad 10.2 7th gen WiFi", "Related 4-5ft provided with carry case"],
      price: "From: $59.75",
      availability: " Quantity",
      image: "/lovable-uploads/Apple_Thunderbolt_Display.webp",
      category: "Bundle"
    },
    {
      id: 2,
      title: "iPad 10.2 7th Gen Cellular and Stand Reader", 
      description: "iPad 10.2 7th gen Cellular with OpenReads software pre-loaded for contactless silent bidding and event management. Hub includes carry cases, strap, and cables.",
      features: ["iPad 10.2 7th gen Cellular", "Related 4-5ft provided with carry case"],
      price: "From: $69.75",
      availability: "Quantity", 
      image: "/lovable-uploads/Samsung_85_4K_Display.webp",
      category: "Bundle"
    }
  ];

  const products = [
    {
      id: 3,
      title: "iPad 10.2 7th Gen WiFi",
      description: "10.2 Retina display with fully anti-glare screen. Custom case registration and charging stands.",
      price: "From: $39.75",
      availability: "Quantity",
      image: "/lovable-uploads/iPad_Pro_12.9_Wi-Fi.webp",
      category: "iPad"
    },
    {
      id: 4,
      title: "iPad 10.2 7th Gen Cellular",
      description: "10.2 Retina display with fully anti-glare screen. Custom case registration and charging stands.",
      price: "From: $49.75", 
      availability: "Quantity",
      image: "/lovable-uploads/iPad_Pro_12.9_Wi-Fi.webp",
      category: "iPad"
    },
    {
      id: 5,
      title: "Smartphone",
      description: "Simple mobile cards reader and register also provided with custom covers and charging stations.",
      price: "From: $29.75",
      availability: "Quantity", 
      image: "/lovable-uploads/iPhone_14_Pro_Max.webp",
      category: "Mobile"
    },
    {
      id: 6,
      title: "Window Intel Desktop",
      description: "Windows 10 Intel system provided with changing/power stations.",
      price: "From: $89.75",
      availability: "Quantity",
      image: "/lovable-uploads/HP_Laptop.webp", 
      category: "Desktop"
    },
    {
      id: 7,
      title: "Apple/MacBook Laptop",
      description: "Business connection for events, leisure, and various catering stations.",
      price: "From: $79.75",
      availability: "Quantity",
      image: "/lovable-uploads/MacBook_Pro_16_M1.webp",
      category: "Laptop"
    }
  ];

  return (
    <div>
    <div className="bg-background px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Bundles Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full mb-4">
              <Package className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Featured Bundles</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Equipment Bundles</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upgrade your bundle with next-gen event digital items
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {bundles.map((bundle) => (
              <Card key={bundle.id} className="product-card group transition-all duration-300 border hover:border-primary/80 overflow-hidden">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative h-60 from-muted to-muted/50">
                    <img 
                      src={bundle.image} 
                      alt={bundle.title}
                      className="product-image w-full h-full object-contain p-8"
                    />
                    <Badge className="absolute top-4 left-4 mb-2 bg-gradient-brand text-primary-foreground">
                      {bundle.category}
                    </Badge>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-center mb-2 transition-colors">
                      {bundle.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {bundle.description}
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      {bundle.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm mb-1">{bundle.price}</p>
                        <p className="text-sm text-muted-foreground mb-4">{bundle.availability}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(bundle.id, getQuantity(bundle.id) - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {getQuantity(bundle.id)}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(bundle.id, getQuantity(bundle.id) + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline"
                      className="w-full gap-2 group-hover:bg-gradient-brand group-hover:text-primary-foreground hover:bg-gradient-brand/90 transition-all"
                      onClick={(e) => createFlyingAnimation(e, bundle)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Individual Products Section */}
        <div>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full mb-4">
              <Tablet className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Individual Items</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">iPads / Laptops</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We Provide iPad / Laptops services for events
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              return (
                <Card key={product.id} className="product-card group transition-all duration-300 border hover:border-primary/90">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="w-32 h-32 rounded-xl flex items-center justify-center mx-auto mb-4 overflow-hidden transition-all duration-300">
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="product-image w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <Badge variant="outline" className="mb-2 bg-gradient-brand text-primary-foreground">{product.category}</Badge>
                      <h3 className="font-bold text-lg mb-2 transition-colors">
                        {product.title}
                      </h3>
                    </div>
                    
                    <p className="text-muted-foreground text-sm text-center mb-6 leading-relaxed">
                      {product.description}
                    </p>
                    
                    <div className="text-center border-t pt-4 space-y-4">
                      <div>
                        <p className="text-sm mb-1">{product.price}</p>
                        <p className="text-sm text-muted-foreground mb-4">{product.availability}</p>
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(product.id, getQuantity(product.id) - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {getQuantity(product.id)}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(product.id, getQuantity(product.id) + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <Button 
                        variant="outline"
                        className="w-full gap-2 group-hover:bg-gradient-brand group-hover:text-primary-foreground transition-all"
                        onClick={(e) => createFlyingAnimation(e, product)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 mb-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full mb-4">
              <Award className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Why Choose Us</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Our Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide the best equipment and services for your events
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group border rounded-xl p-6 transition-all duration-300 hover:border-primary/80">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 group-hover:text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Certified Partner</h3>
              <p className="text-muted-foreground text-sm">
                Trusted B Corporation partnership ensuring quality and reliability
              </p>
            </div>
            
            <div className="text-center group border rounded-xl p-6 transition-all duration-300 hover:border-primary/80">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 group-hover:text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Timely Delivery</h3>
              <p className="text-muted-foreground text-sm">
                Equipment arrives early and is collected after your event
              </p>
            </div>
            
            <div className="text-center group border rounded-xl p-6 transition-all duration-300 hover:border-primary/80">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 group-hover:text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Event Ready</h3>
              <p className="text-muted-foreground text-sm">
                All software and hardware needed for successful events
              </p>
            </div>
          </div>
        </div>

        {/* Proceed to Checkout Section */}
        <div className="mt-16 text-center border-t pt-12">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-xl font-bold">Ready to proceed?</h3>
            <p className="text-muted-foreground">
              Complete your rental with our secure checkout process
            </p>
            <Button 
              className="w-full h-12 text-lg font-semibold bg-gradient-brand text-primary-foreground"
              onClick={onRentNow}
              disabled={getTotalItems() === 0}
            >
              Proceed to Checkout ({getTotalItems()} items)
            </Button>
            {getTotalItems() === 0 && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Add items to your cart before proceeding to checkout
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ProductCatalog;