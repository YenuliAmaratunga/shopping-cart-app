import React from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart, user } = useAppContext();

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add items to your cart');
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          <span className="text-xs font-semibold text-gray-700 tracking-wide uppercase">
            {product.category}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <span className="text-xl font-bold text-gray-900">
            Rs. {product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white focus:ring-4 focus:ring-indigo-100 transition-all duration-200"
            aria-label="Add to cart"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
