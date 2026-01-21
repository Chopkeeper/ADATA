import React, { useState } from 'react';
import { Product } from '../types';
import { generateProductDescription } from '../services/geminiService';
import { Sparkles, Loader2, Tag, Image as ImageIcon } from 'lucide-react';

interface AdminProductsProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const AdminProducts: React.FC<AdminProductsProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  // Add Product Form State
  const [formData, setFormData] = useState<Partial<Product> & { imagesInput: string }>({
    name: '',
    category: '',
    price: 0,
    shippingCost: 0,
    description: '',
    image: 'https://picsum.photos/300/300', // Default fallback
    imagesInput: '', // Raw text for multiple images
    stock: 10
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Discount Management State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [discountValue, setDiscountValue] = useState<number>(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'shippingCost' ? Number(value) : value
    }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.category) {
      alert("Please enter product name and category first.");
      return;
    }
    setIsGenerating(true);
    const desc = await generateProductDescription(formData.name, formData.category);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;
    
    // Parse images from textarea (newline separated)
    const imagesArray = formData.imagesInput 
        ? formData.imagesInput.split('\n').map(s => s.trim()).filter(s => s !== '') 
        : [];
    
    // If no images provided, use the default placeholder
    const primaryImage = imagesArray.length > 0 ? imagesArray[0] : (formData.image || 'https://picsum.photos/300/300');

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category || 'General',
      price: formData.price,
      shippingCost: formData.shippingCost || 0,
      discountPercent: 0, // Default to 0 for new products
      description: formData.description || '',
      image: primaryImage,
      images: imagesArray.length > 0 ? imagesArray : [primaryImage],
      stock: formData.stock || 0
    };

    onAddProduct(newProduct);
    // Reset form
    setFormData({
      name: '', category: '', price: 0, shippingCost: 0, description: '', 
      image: 'https://picsum.photos/300/300', 
      imagesInput: '',
      stock: 10
    });
    alert("Product added successfully!");
  };

  const handleUpdateDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === selectedProductId);
    if (product) {
       onUpdateProduct({
         ...product,
         discountPercent: discountValue
       });
       alert(`Updated discount for ${product.name} to ${discountValue}%`);
       setSelectedProductId('');
       setDiscountValue(0);
    }
  };

  const onSelectProductForDiscount = (id: string) => {
    setSelectedProductId(id);
    const product = products.find(p => p.id === id);
    if (product) {
      setDiscountValue(product.discountPercent);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
       <h1 className="text-3xl font-bold text-advice-darkBlue mb-6">Manage Products</h1>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Forms */}
          <div className="lg:col-span-1 space-y-8">
             
             {/* Add Product Form */}
             <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Add New Product</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700">Product Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 ring-advice-blue outline-none" required />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full border p-2 rounded" placeholder="e.g. Notebook, CPU" required />
                   </div>
                   
                   <div className="grid grid-cols-1 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-gray-700">Price (THB)</label>
                         <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border p-2 rounded" required />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-gray-700">Stock</label>
                         <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full border p-2 rounded" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-700">Shipping Cost</label>
                         <input type="number" name="shippingCost" value={formData.shippingCost} onChange={handleChange} className="w-full border p-2 rounded" />
                      </div>
                   </div>
                   
                   {/* Multiple Image Input */}
                   <div>
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <ImageIcon size={16}/> Product Images (URLs)
                      </label>
                      <p className="text-xs text-gray-400 mb-1">Enter one image URL per line. The first one will be the main cover.</p>
                      <textarea 
                        name="imagesInput" 
                        value={formData.imagesInput} 
                        onChange={handleChange} 
                        className="w-full border p-2 rounded h-24 text-sm font-mono whitespace-pre" 
                        placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                      ></textarea>
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                        Description
                        <button 
                          type="button" 
                          onClick={handleGenerateDescription}
                          disabled={isGenerating}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-purple-200"
                        >
                          {isGenerating ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12} />}
                          AI Generate
                        </button>
                      </label>
                      <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded h-24 text-sm" placeholder="Product details..."></textarea>
                   </div>

                   <button type="submit" className="w-full bg-advice-blue text-white py-2 rounded font-bold hover:bg-advice-darkBlue transition">
                     Save Product
                   </button>
                </form>
             </div>

             {/* Discount Management Form (Separate) */}
             <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-red-500">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                   <Tag size={20} className="text-red-500"/>
                   Manage Discounts
                </h2>
                <form onSubmit={handleUpdateDiscount} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700">Select Product</label>
                      <select 
                        value={selectedProductId} 
                        onChange={(e) => onSelectProductForDiscount(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                      >
                         <option value="" disabled>-- Choose a product --</option>
                         {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                         ))}
                      </select>
                   </div>
                   
                   {selectedProductId && (
                      <div className="p-3 bg-gray-50 rounded text-sm mb-2">
                         <div className="flex justify-between">
                           <span>Current Price:</span>
                           <span className="font-bold">฿{products.find(p => p.id === selectedProductId)?.price.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between text-red-500">
                           <span>Current Discount:</span>
                           <span className="font-bold">{products.find(p => p.id === selectedProductId)?.discountPercent}%</span>
                         </div>
                      </div>
                   )}

                   <div>
                      <label className="block text-sm font-medium text-gray-700">New Discount (%)</label>
                      <div className="flex items-center gap-2">
                        <input 
                           type="number" 
                           value={discountValue} 
                           onChange={(e) => setDiscountValue(Number(e.target.value))} 
                           className="flex-1 border p-2 rounded" 
                           min="0" 
                           max="100" 
                           required 
                           disabled={!selectedProductId}
                        />
                        <span className="text-gray-500">%</span>
                      </div>
                   </div>

                   <button 
                     type="submit" 
                     className={`w-full py-2 rounded font-bold transition text-white ${!selectedProductId ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                     disabled={!selectedProductId}
                   >
                     Apply Discount
                   </button>
                </form>
             </div>
          </div>

          {/* Product List */}
          <div className="lg:col-span-2">
             <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm text-left">
                   <thead className="bg-gray-100 text-gray-700 font-bold">
                      <tr>
                         <th className="p-3">Product</th>
                         <th className="p-3">Price</th>
                         <th className="p-3">Disc.</th>
                         <th className="p-3">Stock</th>
                         <th className="p-3 text-right">Action</th>
                      </tr>
                   </thead>
                   <tbody>
                      {products.map(p => (
                         <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                               <div className="font-semibold text-advice-blue">{p.name}</div>
                               <div className="text-xs text-gray-500">{p.category}</div>
                               {/* Show number of images indicator */}
                               {p.images && p.images.length > 1 && (
                                   <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                       <ImageIcon size={10} /> {p.images.length} images
                                   </div>
                               )}
                            </td>
                            <td className="p-3">฿{p.price.toLocaleString()}</td>
                            <td className="p-3">
                              {p.discountPercent > 0 ? (
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                                   {p.discountPercent}%
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-3">{p.stock}</td>
                            <td className="p-3 text-right flex justify-end gap-2">
                               <button 
                                 onClick={() => onSelectProductForDiscount(p.id)}
                                 className="text-blue-500 hover:text-blue-700 font-medium px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                               >
                                 Set Disc.
                               </button>
                               <button 
                                 onClick={() => onDeleteProduct(p.id)}
                                 className="text-red-500 hover:text-red-700 font-medium px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                               >
                                 Delete
                               </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
                {products.length === 0 && <div className="p-8 text-center text-gray-500">No products available.</div>}
             </div>
          </div>
       </div>
    </div>
  );
};

export default AdminProducts;