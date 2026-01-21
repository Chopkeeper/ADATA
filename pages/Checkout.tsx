import React, { useState, useMemo } from 'react';
import { CartItem, User, Order, Coupon } from '../types';
import { INITIAL_COUPONS } from '../services/mockData';
import { QrCode, CheckCircle, Loader2, Upload, AlertCircle, Ticket, X } from 'lucide-react';

interface CheckoutProps {
  cart: CartItem[];
  user: User;
  onPlaceOrder: (items: CartItem[], total: number, breakdown: any) => void;
  clearCart: () => void;
  taxRate: number;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, user, onPlaceOrder, clearCart, taxRate }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Review, 2: Payment, 3: Success
  const [verifying, setVerifying] = useState(false);
  const [slipUploaded, setSlipUploaded] = useState(false);
  
  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupons, setAppliedCoupons] = useState<Coupon[]>([]);

  // Calculate Financials
  const { subtotal, shipping, discount, tax, total } = useMemo(() => {
    // 1. Calculate Base Item Subtotal (After Product Discount)
    const itemSubtotal = cart.reduce((sum, item) => {
        const price = item.price - (item.price * item.discountPercent / 100);
        return sum + (price * item.quantity);
    }, 0);

    // 2. Calculate Coupon Discounts (Stackable)
    let totalDiscount = 0;
    let isFreeShipping = false;

    appliedCoupons.forEach(coupon => {
       if (coupon.type === 'fixed') {
          totalDiscount += coupon.value;
       } else if (coupon.type === 'percent') {
          totalDiscount += (itemSubtotal * coupon.value / 100);
       } else if (coupon.type === 'free_shipping') {
          isFreeShipping = true;
       }
    });

    // 3. Shipping Cost
    const baseShipping = cart.reduce((sum, item) => sum + (item.shippingCost * item.quantity), 0);
    const finalShipping = isFreeShipping ? 0 : baseShipping;

    // 4. Tax Base (Subtotal - Discount)
    // Note: If discount > subtotal, tax base is 0
    const taxableAmount = Math.max(0, itemSubtotal - totalDiscount);
    const vatRate = taxRate / 100;
    const taxAmount = taxableAmount * vatRate;

    // 5. Grand Total
    const grandTotal = taxableAmount + taxAmount + finalShipping;

    return {
       subtotal: itemSubtotal,
       shipping: finalShipping,
       discount: totalDiscount,
       tax: taxAmount,
       total: grandTotal
    };
  }, [cart, appliedCoupons, taxRate]);

  const handleApplyCoupon = () => {
     // Find coupon in mock data (Real app would call API)
     const found = INITIAL_COUPONS.find(c => c.code === couponInput.toUpperCase() && c.isActive);
     
     if (!found) {
        alert("Invalid or expired coupon code.");
        return;
     }

     if (appliedCoupons.some(c => c.code === found.code)) {
        alert("This coupon is already applied.");
        return;
     }

     setAppliedCoupons(prev => [...prev, found]);
     setCouponInput('');
  };

  const removeCoupon = (code: string) => {
     setAppliedCoupons(prev => prev.filter(c => c.code !== code));
  };

  const handleConfirmOrder = () => {
    setStep(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
       setSlipUploaded(true);
    }
  };

  const handleVerifyPayment = () => {
     if (!slipUploaded) return;
     
     setVerifying(true);
     setTimeout(() => {
        setVerifying(false);
        const breakdown = { subtotal, shipping, tax, discount, total, appliedCoupons: appliedCoupons.map(c => c.code) };
        onPlaceOrder(cart, total, breakdown);
        clearCart();
        setStep(3);
     }, 3000);
  };

  if (cart.length === 0 && step === 1) {
     return <div className="p-10 text-center">Your cart is empty.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
       <h1 className="text-2xl font-bold mb-6 text-advice-darkBlue flex items-center gap-2">
         {step === 1 && "Checkout: Review & Promotions"}
         {step === 2 && "Checkout: Payment (PromptPay)"}
         {step === 3 && "Order Complete"}
       </h1>

       {step === 1 && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Items */}
            <div className="md:col-span-2 space-y-6">
               <div className="bg-white p-6 rounded shadow">
                  <h2 className="font-bold mb-4 text-lg">Items</h2>
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-start border-b py-4 last:border-0">
                       <div className="flex items-start gap-4">
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-contain border rounded" />
                          <div>
                             <div className="font-medium text-gray-800">{item.name}</div>
                             <div className="text-gray-500 text-sm">
                                {item.quantity} x ฿{(item.price * (1 - item.discountPercent/100)).toLocaleString()}
                             </div>
                             {item.discountPercent > 0 && <span className="text-xs text-red-500 bg-red-50 px-1 rounded">-{item.discountPercent}% Off</span>}
                          </div>
                       </div>
                       <div className="font-semibold">฿{((item.price * (1 - item.discountPercent/100)) * item.quantity).toLocaleString()}</div>
                    </div>
                  ))}
               </div>

               {/* Coupon Section */}
               <div className="bg-white p-6 rounded shadow border-l-4 border-advice-orange">
                  <h2 className="font-bold mb-4 text-lg flex items-center gap-2">
                     <Ticket className="text-advice-orange"/> Promotions
                  </h2>
                  <div className="flex gap-2 mb-4">
                     <input 
                        type="text" 
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Enter coupon code (e.g., WELCOME100)"
                        className="flex-1 border p-2 rounded focus:ring-2 ring-advice-orange outline-none uppercase"
                     />
                     <button onClick={handleApplyCoupon} className="bg-gray-800 text-white px-4 rounded font-medium hover:bg-black">
                        Apply
                     </button>
                  </div>
                  
                  {appliedCoupons.length > 0 && (
                     <div className="flex flex-wrap gap-2">
                        {appliedCoupons.map(c => (
                           <div key={c.id} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-green-200">
                              <span className="font-bold">{c.code}</span>
                              <span className="text-xs">
                                 ({c.type === 'free_shipping' ? 'Free Ship' : c.type === 'percent' ? `-${c.value}%` : `-฿${c.value}`})
                              </span>
                              <button onClick={() => removeCoupon(c.code)} className="hover:text-red-600"><X size={14}/></button>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
            
            {/* Right: Summary */}
            <div className="bg-white p-6 rounded shadow h-fit sticky top-24">
               <h2 className="font-bold mb-4 text-lg border-b pb-2">Order Summary</h2>
               
               <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                     <span>Subtotal (items)</span>
                     <span>฿{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  
                  {appliedCoupons.length > 0 && (
                     <div className="flex justify-between text-green-600">
                        <span>Discounts (Coupons)</span>
                        <span>-฿{discount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                     </div>
                  )}

                  <div className="flex justify-between">
                     <span>VAT ({taxRate}%)</span>
                     <span>฿{tax.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>

                  <div className="flex justify-between">
                     <span>Shipping</span>
                     {shipping === 0 && appliedCoupons.some(c => c.type === 'free_shipping') ? (
                        <span className="text-green-600 font-bold">Free</span>
                     ) : (
                        <span>฿{shipping.toLocaleString()}</span>
                     )}
                  </div>
               </div>

               <hr className="my-4"/>
               
               <div className="flex justify-between mb-6 font-bold text-xl text-advice-blue">
                  <span>Grand Total</span>
                  <span>฿{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
               </div>
               
               <button 
                 onClick={handleConfirmOrder}
                 className="w-full bg-advice-blue hover:bg-advice-darkBlue text-white font-bold py-3 rounded shadow-lg transition transform hover:scale-[1.02]"
               >
                 Confirm Order
               </button>
            </div>
         </div>
       )}

       {step === 2 && (
         <div className="bg-white p-8 rounded shadow max-w-md mx-auto text-center">
            <div className="bg-[#003d7c] text-white p-4 rounded-t-lg -mx-8 -mt-8 mb-6">
               <h2 className="text-xl font-bold">Thai QR Payment</h2>
               <p className="text-sm opacity-80">PromptPay</p>
            </div>
            
            <div className="mb-6">
               <p className="text-gray-600 mb-2">Scan to pay</p>
               <div className="bg-gray-100 p-4 inline-block rounded border-2 border-advice-blue">
                 <div className="w-48 h-48 bg-white flex items-center justify-center relative overflow-hidden">
                    <QrCode size={150} className="text-gray-800" />
                 </div>
               </div>
               <p className="text-2xl font-bold text-advice-blue mt-4">฿{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>

            <div className="text-left bg-gray-50 p-4 rounded mb-4">
               <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                 <Upload size={16}/> Upload Payment Slip
               </label>
               <input 
                 type="file" 
                 accept="image/*"
                 onChange={handleFileUpload}
                 className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
               />
            </div>

            <button 
               onClick={handleVerifyPayment}
               disabled={!slipUploaded || verifying}
               className={`w-full py-3 rounded font-bold text-white transition flex items-center justify-center gap-2
                 ${!slipUploaded || verifying ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
               {verifying ? <><Loader2 className="animate-spin" /> Verifying...</> : "Confirm Payment"}
            </button>
         </div>
       )}

       {step === 3 && (
         <div className="bg-white p-12 rounded shadow text-center max-w-lg mx-auto">
            <div className="flex justify-center mb-6">
               <CheckCircle size={80} className="text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-8">Thank you for your purchase.</p>
            <button 
               onClick={() => window.location.hash = '/'}
               className="bg-advice-blue text-white px-8 py-3 rounded font-bold hover:bg-advice-darkBlue"
            >
               Back to Home
            </button>
         </div>
       )}
    </div>
  );
};

export default Checkout;