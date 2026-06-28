import React, { useState, useEffect } from 'react';
import BookingWizard from './BookingWizard';
import { X } from 'lucide-react';

const BookingModal = ({ isOpen, onClose, initialStep = 0 }) => {
  const [cartItems, setCartItems] = useState([]);

  // Sync with localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = JSON.parse(localStorage.getItem('sana_cart')) || [];
        setCartItems(saved);
      } catch (e) {
        setCartItems([]);
      }
    }
  }, [isOpen]);

  const handleCartUpdate = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem('sana_cart', JSON.stringify(newCart));
    // Dispatch cart-updated event so headers/counters are in sync
    window.dispatchEvent(new Event('cart-updated'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden relative max-h-[88vh] flex flex-col md:flex-row animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[60] p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-600 text-slate-500 transition-colors shadow-sm"
          aria-label="Close booking"
        >
          <X size={20} />
        </button>

        <BookingWizard
          isModal={true}
          onCloseModal={onClose}
          existingCart={cartItems}
          onCartUpdate={handleCartUpdate}
          initialStep={initialStep}
        />
      </div>
    </div>
  );
};

export default BookingModal;
