import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, CheckCircle, Truck, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const RentalInquiry = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  return (
    <div className="min-h-screen bg-gradient-subtle py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent">
                givergy
              </span>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Certified B Corporation
              </span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Event Equipment Rental
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Givergy and One World Rental partner together to provide you with all the software 
            and hardware you need to make your own event a success.
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-elegant border-0 overflow-hidden">
          <div className="bg-gradient-brand p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Start Your Hardware Rental Inquiry
            </h2>
            <p className="text-white/90">
              Provide your event dates to get started
            </p>
          </div>
          
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Start Date */}
              <div className="space-y-3">
                <Label htmlFor="start-date" className="text-base font-semibold flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Rental Start Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-12 border-2 hover:border-primary/50 transition-colors",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-3">
                <Label htmlFor="end-date" className="text-base font-semibold flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Rental End Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-12 border-2 hover:border-primary/50 transition-colors",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      disabled={(date) => date < (startDate || new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-accent/50 border border-accent rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <Truck className="w-5 h-5 text-accent-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-accent-foreground mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Delivery Information
                  </h3>
                  <p className="text-accent-foreground/80 leading-relaxed">
                    Equipment delivery arrives a minimum of 2 days before your rental start date 
                    and is collected 2 days after your rental end date to ensure everything is 
                    ready for your event.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <Button
                variant="gradient"
                size="lg"
                className="px-12 py-4 text-lg font-semibold"
                disabled={!startDate || !endDate}
              >
                Continue Rental Inquiry
              </Button>
              {(!startDate || !endDate) && (
                <p className="text-sm text-muted-foreground mt-3">
                  Please select both rental dates to continue
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Certified Partner</h3>
            <p className="text-sm text-muted-foreground">
              Trusted B Corporation partnership ensuring quality and reliability
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Timely Delivery</h3>
            <p className="text-sm text-muted-foreground">
              Equipment arrives early and is collected after your event
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Event Ready</h3>
            <p className="text-sm text-muted-foreground">
              All software and hardware needed for successful events
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalInquiry;