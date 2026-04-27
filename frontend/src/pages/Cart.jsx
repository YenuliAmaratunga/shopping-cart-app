import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useAppContext();
  const [showCheckoutSummary, setShowCheckoutSummary] = React.useState(false);

  const shipping = 500;
  const tax = cartTotal * 0.08;
  const grandTotal = cartTotal + shipping + tax;

  const handleCheckout = () => {
    setShowCheckoutSummary(true);
  };

  const closeCheckout = () => {
    setShowCheckoutSummary(false);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-12 w-12 text-indigo-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Looks like you haven't added anything to your cart yet. Browse our products and find something you love!
        </p>
        <Link 
          to="/" 
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
          ← Back to shop
        </Link>
      </div>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
        <div className="lg:col-span-8">
          <ul className="space-y-6">
            {cart.map((item) => (
              <li key={item.id} className="flex flex-col sm:flex-row bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-6">
                <div className="w-full sm:w-32 h-32 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain rounded-xl bg-gray-50"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-gray-900 font-medium">Rs. {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping estimate</span>
                <span className="text-gray-900 font-medium">Rs. {shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax estimate</span>
                <span className="text-gray-900 font-medium">Rs. {tax.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between text-lg font-bold text-gray-900">
                <span>Order total</span>
                <span>Rs. {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 group"
            >
              <span>Checkout</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-4 text-xs text-center text-gray-500">
              Payment gateway will be implemented.
            </p>
          </div>
        </div>
      </div>

      {showCheckoutSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Review your order</h2>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div className="flex justify-between"><span>Subtotal</span><span>Rs. {cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>Rs. {shipping.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>Rs. {tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span>Rs. {grandTotal.toFixed(2)}</span></div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeCheckout}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-gray-900 px-4 py-3 font-medium text-white opacity-80 cursor-not-allowed"
                disabled
              >
                Proceed to Payment
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-gray-500">
              Payment integration will be implemented.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
