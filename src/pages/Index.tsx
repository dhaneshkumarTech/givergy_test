import React, { useState, useEffect } from "react";
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
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const navigate = useNavigate();

  // Listen for date validation events from CartPopup
  useEffect(() => {
    const handleDateValidation = () => {
      setShowDateValidation(true);
      setPendingCheckout(true);
    };

    window.addEventListener('show-date-validation', handleDateValidation);
    return () => {
      window.removeEventListener('show-date-validation', handleDateValidation);
    };
  }, []);

// Do not auto-proceed to checkout when dates are selected
  useEffect(() => {
    if (pendingCheckout && startDate && endDate) {
      const { getTotalItems } = useCartStore.getState();
      if (getTotalItems() > 0) {
        useCartStore.getState().setDates(startDate, endDate);
        setPendingCheckout(false);
        setShowDateValidation(false);
        // User must click checkout
      }
    }
  }, [startDate, endDate, pendingCheckout]); // Remove navigate dependency to avoid auto-navigation

  const handleProceedToCheckout = () => {
    if (startDate && endDate) {
      navigate('/checkout');
    } else {
      setShowDateValidation(true);
    }
  }; 

  // Make handleProceedToCheckout available to be called by user action (e.g. button click)

  const handleContinue = () => {
    if (startDate && endDate) {
      useCartStore.getState().setDates(startDate, endDate);
      setShowProducts(true);
      setShowDateValidation(false);
      setPendingCheckout(false); // Clear any pending checkout
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
