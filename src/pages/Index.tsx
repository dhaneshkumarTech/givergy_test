import React, { useState } from "react";
import RentalInquiry from "@/components/RentalInquiry";
import ProductCatalog from "@/components/ProductCatalog";
import Header from "@/components/Header";
import { useCartStore } from "@/store/cart";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [showProducts, setShowProducts] = useState(false);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (startDate && endDate) {
      useCartStore.getState().setDates(startDate, endDate);
      setShowProducts(true);
    }
  };

  const handleRentNow = () => {
    const { getTotalItems } = useCartStore.getState();
    if (getTotalItems() > 0) {
      navigate('/checkout');
    }
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
      {showProducts && <ProductCatalog onRentNow={handleRentNow} />}
    </div>
  );
};

export default Index;
