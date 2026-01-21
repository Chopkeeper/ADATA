import React from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../types';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => {
  const finalPrice = product.price - (product.price * product.discountPercent / 100);

  return (
    <div className="bg-white border border-gray-200 hover:shadow-xl transition-shadow duration-300 rounded-sm flex flex-col h-full group relative">
       {/* Discount Badge */}
       {product.discountPercent > 0 && (
         <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-sm z-10">
           -{product.discountPercent}%
         </div>
       )}

       {/* Image - Clickable */}
       <Link to={`/product/${product.id}`} className="block">
         <div className="p-4 flex justify-center items-center h-48 overflow-hidden bg-white cursor-pointer">
            <img 
              src={product.image} 
              alt={product.name} 
              className="object-contain max-h-full group-hover:scale-105 transition-transform duration-300"
            />
         </div>
       </Link>

       {/* Content */}
       <div className="p-4 flex flex-col flex-1 bg-gray-50 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-1">{product.category}</div>
          
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 h-10 mb-2 group-hover:text-advice-blue cursor-pointer">
              {product.name}
            </h3>
          </Link>
          
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
          
          <div className="mt-auto">
             {product.discountPercent > 0 && (
               <div className="text-xs text-gray-400 line-through">฿{product.price.toLocaleString()}</div>
             )}
             <div className="text-lg font-bold text-red-600">
               ฿{finalPrice.toLocaleString()}
             </div>
             
             <div className="flex gap-2 mt-3">
               <button 
                 onClick={() => onAdd(product)}
                 className="flex-1 bg-advice-blue hover:bg-advice-darkBlue text-white text-sm font-medium py-2 rounded-sm flex items-center justify-center gap-2 transition-colors"
               >
                 <ShoppingCart size={16} /> Add
               </button>
               <Link 
                 to={`/product/${product.id}`}
                 className="px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-sm flex items-center justify-center"
               >
                 <Eye size={16} />
               </Link>
             </div>
          </div>
       </div>
    </div>
  );
};

export default ProductCard;