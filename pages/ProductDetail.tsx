import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { ShoppingCart, ArrowLeft, X, ZoomIn } from 'lucide-react';

interface ProductDetailProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ products, onAddToCart }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const found = products.find(p => p.id === id);
    setProduct(found);
    if (found) {
      // Use the first image from the array, or the legacy image field
      const initialImage = found.images && found.images.length > 0 ? found.images[0] : found.image;
      setActiveImage(initialImage);
    }
  }, [id, products]);

  if (!product) {
    return (
        <div className="container mx-auto p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-600">Product not found</h2>
            <button onClick={() => navigate('/')} className="mt-4 text-advice-blue hover:underline">Back to Home</button>
        </div>
    );
  }

  const finalPrice = product.price - (product.price * product.discountPercent / 100);
  // Ensure we have an array of images to map over
  const galleryImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb / Back */}
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center text-gray-500 hover:text-advice-blue mb-6 transition-colors"
      >
        <ArrowLeft size={18} className="mr-1" /> Back to Products
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6 lg:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col">
             {/* Main Image */}
             <div className="relative group border border-gray-200 rounded-lg overflow-hidden mb-4 bg-white h-[400px] flex items-center justify-center">
                <img 
                  src={activeImage} 
                  alt={product.name} 
                  className="max-h-full max-w-full object-contain cursor-zoom-in transition-transform duration-300"
                  onClick={() => setIsLightboxOpen(true)}
                />
                <div 
                    className="absolute top-4 right-4 bg-white/80 p-2 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    onClick={() => setIsLightboxOpen(true)}
                >
                    <ZoomIn size={20} className="text-gray-700"/>
                </div>
             </div>

             {/* Thumbnails */}
             <div className="flex space-x-2 overflow-x-auto py-2">
                {galleryImages.map((img, idx) => (
                   <div 
                     key={idx}
                     className={`w-20 h-20 flex-shrink-0 border-2 rounded cursor-pointer p-1 bg-white
                        ${activeImage === img ? 'border-advice-blue' : 'border-gray-200 hover:border-gray-300'}`}
                     onClick={() => setActiveImage(img)}
                   >
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain" />
                   </div>
                ))}
             </div>
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col">
             <div className="text-sm text-gray-500 font-medium mb-2">{product.category}</div>
             <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">{product.name}</h1>
             
             {/* Price Block */}
             <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
                <div className="flex items-end gap-3 mb-1">
                   {product.discountPercent > 0 && (
                      <span className="text-lg text-gray-400 line-through">฿{product.price.toLocaleString()}</span>
                   )}
                   <span className="text-3xl font-bold text-red-600">฿{finalPrice.toLocaleString()}</span>
                </div>
                {product.discountPercent > 0 && (
                   <div className="text-sm text-red-500 font-semibold">Save {product.discountPercent}%</div>
                )}
             </div>

             {/* Description */}
             <div className="mb-8">
                <h3 className="font-bold text-gray-700 mb-2">Product Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {product.description || "No detailed description available."}
                </p>
             </div>

             {/* Meta */}
             <div className="mb-8 space-y-2 text-sm text-gray-600">
                <div className="flex">
                    <span className="w-32 font-semibold">Stock:</span>
                    <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                        {product.stock > 0 ? `${product.stock} items available` : "Out of Stock"}
                    </span>
                </div>
                <div className="flex">
                    <span className="w-32 font-semibold">Shipping:</span>
                    <span>฿{product.shippingCost}</span>
                </div>
             </div>

             {/* Action */}
             <div className="mt-auto">
                <button 
                  onClick={() => onAddToCart(product)}
                  className="w-full md:w-auto px-8 py-4 bg-advice-blue hover:bg-advice-darkBlue text-white font-bold rounded shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 text-lg"
                >
                   <ShoppingCart size={24} />
                   Add to Cart
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsLightboxOpen(false)}>
           <button 
             className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
             onClick={() => setIsLightboxOpen(false)}
           >
             <X size={32} />
           </button>
           
           <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img 
                 src={activeImage} 
                 alt="Full size" 
                 className="max-h-[85vh] max-w-full object-contain shadow-2xl"
              />
              
              {/* Thumbnail strip in lightbox */}
              <div className="flex gap-2 mt-4 overflow-x-auto max-w-full px-4">
                 {galleryImages.map((img, idx) => (
                    <img 
                      key={idx}
                      src={img} 
                      alt={`Thumb ${idx}`} 
                      className={`h-16 w-16 object-cover cursor-pointer border-2 rounded ${activeImage === img ? 'border-advice-blue opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      onClick={() => setActiveImage(img)}
                    />
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;