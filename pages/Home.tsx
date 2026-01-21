import React, { useState } from 'react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

interface HomeProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const Home: React.FC<HomeProps> = ({ products, onAddToCart, selectedCategory, onSelectCategory }) => {
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="pb-10">
      {/* Hero Banner Section */}
      <div className="bg-advice-lightBlue mb-6">
        <div className="container mx-auto px-0 lg:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 py-4">
             {/* Left Banner (Desktop only) */}
             <div className="hidden lg:block bg-white h-80 rounded-lg shadow-lg overflow-hidden">
                <img src="https://picsum.photos/300/400?random=10" alt="Promo" className="w-full h-full object-cover" />
             </div>
             
             {/* Main Slider */}
             <div className="col-span-1 lg:col-span-2 bg-gray-800 h-64 lg:h-80 relative rounded-lg overflow-hidden shadow-lg group">
                <img src="https://picsum.photos/800/400?random=11" alt="Main Banner" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
                   <h2 className="text-4xl font-bold mb-4 text-shadow-lg">Super Sale</h2>
                   <p className="text-xl">Up to 50% Off</p>
                   <button className="mt-6 bg-advice-orange px-6 py-2 rounded font-bold hover:bg-orange-500 transition">Shop Now</button>
                </div>
             </div>

             {/* Right Banner (Desktop only) */}
             <div className="hidden lg:block bg-white h-80 rounded-lg shadow-lg overflow-hidden">
                <img src="https://picsum.photos/300/400?random=12" alt="Promo" className="w-full h-full object-cover" />
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        
        {/* Category Filter */}
        <div className="mb-6 flex overflow-x-auto space-x-2 pb-2">
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => onSelectCategory(cat)}
               className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border
                  ${selectedCategory === cat 
                    ? 'bg-advice-blue text-white border-advice-blue' 
                    : 'bg-white text-gray-600 border-gray-300 hover:border-advice-blue hover:text-advice-blue'}`}
             >
               {cat}
             </button>
           ))}
        </div>

        {/* Product Grid */}
        <div className="mb-4 flex items-center justify-between">
           <h2 className="text-xl font-bold text-gray-800 border-l-4 border-advice-orange pl-3">
             {selectedCategory === 'All' ? 'Flash Sale & Recommended' : `${selectedCategory}`}
           </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onAdd={onAddToCart} />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded shadow-sm">
             <div className="text-gray-400 mb-2">No products found in category</div>
             <div className="text-xl font-bold text-advice-blue">"{selectedCategory}"</div>
             <button 
               onClick={() => onSelectCategory('All')}
               className="mt-4 text-sm text-gray-500 underline hover:text-advice-orange"
             >
               View all products
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;