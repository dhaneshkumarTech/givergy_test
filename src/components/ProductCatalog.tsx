import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Tablet, Laptop, Monitor } from "lucide-react";

const ProductCatalog = () => {
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
              <Card key={bundle.id} className="group hover:shadow-elegant transition-all duration-300 border-2 hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img 
                        src={bundle.image} 
                        alt={bundle.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-2">{bundle.category}</Badge>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                        {bundle.title}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {bundle.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {bundle.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="font-bold text-lg text-primary">{bundle.price}</p>
                      <p className="text-sm text-muted-foreground">{bundle.availability}</p>
                    </div>
                    <Button variant="gradient" className="gap-2">
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
                    
                    <div className="text-center border-t pt-4">
                      <p className="font-bold text-lg text-primary mb-1">{product.price}</p>
                      <p className="text-sm text-muted-foreground mb-4">{product.availability}</p>
                      <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
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
      </div>
    </div>
  );
};

export default ProductCatalog;