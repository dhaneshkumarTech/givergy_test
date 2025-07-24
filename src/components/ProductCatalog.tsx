import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cart";
import { ShoppingCart, Package, Tablet, Award, Clock, CheckCircle, Plus, Minus } from "lucide-react";

const ProductCatalog = () => {
  const { addItem } = useCartStore();
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  const getQuantity = (id: number) => quantities[id] || 1;
  
  const updateQuantity = (id: number, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, quantity)
    }));
  };

  const handleAddToCart = (item: any) => {
    const quantity = getQuantity(item.id);
    addItem({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      category: item.category
    }, quantity);
  };
  const bundles = [
    {
      id: 1,
      title: "iPad 10.2 7-inch WiFi AND STAND READER",
      description: "iPad 10.2 7-inch WiFi with OpenReads software pre-loaded for contactless silent bidding and event management. Hub includes carry cases, strap, and cables.",
      features: ["iPad 10.2 7-inch WiFi", "Related 4-5ft provided with carry case"],
      price: "From: £59.75",
      availability: "Check Availability",
      image: "/lovable-uploads/eb59e792-64fe-4943-b338-de6dab0a3c9c.png",
      category: "Bundle"
    },
    {
      id: 2,
      title: "iPad 10.2 7-inch CELLULAR AND STAND READER", 
      description: "iPad 10.2 7-inch Cellular with OpenReads software pre-loaded for contactless silent bidding and event management. Hub includes carry cases, strap, and cables.",
      features: ["iPad 10.2 7-inch Cellular", "Related 4-5ft provided with carry case"],
      price: "From: £69.75",
      availability: "Check Availability", 
      image: "/lovable-uploads/eb59e792-64fe-4943-b338-de6dab0a3c9c.png",
      category: "Bundle"
    }
  ];

  const products = [
    {
      id: 3,
      title: "iPad 10.2 7-inch WiFi",
      description: "10.2 Retina display with fully anti-glare screen. Custom case registration and charging stands.",
      price: "From: £39.75",
      availability: "Check Availability",
      image: "/lovable-uploads/eb59e792-64fe-4943-b338-de6dab0a3c9c.png",
      category: "iPad"
    },
    {
      id: 4,
      title: "iPad 10.2 7-inch CELLULAR",
      description: "10.2 Retina display with fully anti-glare screen. Custom case registration and charging stands.",
      price: "From: £49.75", 
      availability: "Check Availability",
      image: "/lovable-uploads/eb59e792-64fe-4943-b338-de6dab0a3c9c.png",
      category: "iPad"
    },
    {
      id: 5,
      title: "SMARTPHONE",
      description: "Simple mobile cards reader and register also provided with custom covers and charging stations.",
      price: "From: £29.75",
      availability: "Check Availability", 
      image: "/lovable-uploads/eb59e792-64fe-4943-b338-de6dab0a3c9c.png",
      category: "Mobile"
    },
    {
      id: 6,
      title: "WINDOWS INTEL DESKTOP",
      description: "Windows 10 Intel system provided with changing/power stations.",
      price: "From: £89.75",
      availability: "Check Availability",
      image: "/lovable-uploads/eb59e792-64fe-4943-b338-de6dab0a3c9c.png", 
      category: "Desktop"
    },
    {
      id: 7,
      title: "APPLE/MAC LAPTOPS",
      description: "Business connection for events, leisure, and various catering stations.",
      price: "From: £79.75",
      availability: "Check Availability",
      image: "/lovable-uploads/eb59e792-64fe-4943-b338-de6dab0a3c9c.png",
      category: "Laptop"
    }
  ];

  return (
    <div className="bg-background py-16 px-4">
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
              <Card key={bundle.id} className="group hover:shadow-elegant transition-all duration-300 border hover:border-primary/20 overflow-hidden">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50">
                    <img 
                      src={bundle.image} 
                      alt={bundle.title}
                      className="w-full h-full object-contain p-8"
                    />
                    <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                      {bundle.category}
                    </Badge>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-3 text-primary group-hover:text-primary/80 transition-colors">
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
                        <p className="font-bold text-xl text-primary">{bundle.price}</p>
                        <p className="text-sm text-muted-foreground">{bundle.availability}</p>
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
                      variant="default" 
                      className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      onClick={() => handleAddToCart(bundle)}
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
                <Card key={product.id} className="group hover:shadow-elegant transition-all duration-300 border hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="w-24 h-24 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4 overflow-hidden group-hover:shadow-glow transition-all duration-300">
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <Badge variant="outline" className="mb-2">{product.category}</Badge>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                    </div>
                    
                    <p className="text-muted-foreground text-sm text-center mb-6 leading-relaxed">
                      {product.description}
                    </p>
                    
                    <div className="text-center border-t pt-4 space-y-4">
                      <div>
                        <p className="font-bold text-lg text-primary mb-1">{product.price}</p>
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
                        className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        onClick={() => handleAddToCart(product)}
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
        <div className="mt-24">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Certified Partner</h3>
              <p className="text-muted-foreground text-sm">
                Trusted B Corporation partnership ensuring quality and reliability
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Timely Delivery</h3>
              <p className="text-muted-foreground text-sm">
                Equipment arrives early and is collected after your event
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Event Ready</h3>
              <p className="text-muted-foreground text-sm">
                All software and hardware needed for successful events
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;