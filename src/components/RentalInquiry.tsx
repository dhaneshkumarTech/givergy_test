import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, CheckCircle, Truck, Clock } from "lucide-react";
import CartButton from "@/components/CartButton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RentalInquiryProps {
  startDate?: Date;
  endDate?: Date;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  onContinue: () => void;
  showValidation?: boolean;
}
const RentalInquiry: React.FC<RentalInquiryProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onContinue,
  showValidation = false,
}) => {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      setStartDateOpen(false); // Auto-close calendar
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      setEndDate(date);
      setEndDateOpen(false); // Auto-close calendar
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-4 px-4 mt-16">
      <div className="text-center mb-12 relative mt-6">
        <h1 className="text-4xl font-bold text-foreground mb-4">
            Event Equipment Rental
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Givergy and One World Rental partner together to provide you with all the software 
            and hardware you need to make your own event a success.
          </p>
      </div>
      <div className="max-w-4xl mx-auto">
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
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-12 border-2 hover:border-primary/50 transition-colors",
                        !startDate && "text-muted-foreground",
                        showValidation && !startDate && "border-red-500 bg-red-50"
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
                      onSelect={handleStartDateSelect}
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
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-12 border-2 hover:border-primary/50 transition-colors",
                        !endDate && "text-muted-foreground",
                        showValidation && !endDate && "border-red-500 bg-red-50"
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
                      onSelect={handleEndDateSelect}
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
                onClick={() => {
                  onContinue();
                  // Scroll to products section after continue
                  setTimeout(() => {
                    const productsSection = document.getElementById('products-section');
                    if (productsSection) {
                      productsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
                disabled={!startDate || !endDate}
              >
                Continue Rental Inquiry
              </Button>
              {showValidation && (!startDate || !endDate) && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">
                    ⚠️ Please select both rental dates to proceed with checkout
                  </p>
                </div>
              )}
              {!showValidation && (!startDate || !endDate) && (
                <p className="text-sm text-muted-foreground mt-3">
                  Please select both rental dates to continue
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RentalInquiry;