import React, { useRef, useState } from "react";
import RentalInquiry from "@/components/RentalInquiry";
import ProductCatalog from "@/components/ProductCatalog";
import Header from "@/components/Header";

const Index = () => {
    const productsRef = useRef<HTMLDivElement>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleContinue = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div>
      <Header />
      <RentalInquiry
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        onContinue={handleContinue}
      />
      <ProductCatalog ref={productsRef} />
    </div>
  );
};

export default Index;
