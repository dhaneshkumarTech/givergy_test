import React, { useState } from "react";
import RentalInquiry from "@/components/RentalInquiry";
import ProductCatalog from "@/components/ProductCatalog";
import Header from "@/components/Header";
import { useCartStore } from "@/store/cart";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [showProducts, setShowProducts] = useState(true); // Show products immediately
  const [showDateValidation, setShowDateValidation] = useState(false);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (startDate && endDate) {
      useCartStore.getState().setDates(startDate, endDate);
      setShowProducts(true);
      setShowDateValidation(false);
    } else {
      setShowDateValidation(true);
    }
  };

  const handleRentNow = () => {
    const { getTotalItems } = useCartStore.getState();
    if (getTotalItems() > 0) {
      if (startDate && endDate) {
        navigate('/checkout');
      } else {
        setShowDateValidation(true);
        // Scroll to rental inquiry section
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
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
        showValidation={showDateValidation}
      />
      {showProducts && <ProductCatalog onRentNow={handleRentNow} />}
    </div>
  );
};

export default Index;
