
import React, { useState, useEffect } from 'react';
// FIX: Import ProductWithStock to handle products with stock information.
import { Product, ProductWithStock } from '../types';

interface ProductFormProps {
  // FIX: Update onSubmit handler to include stock information.
  onSubmit: (productData: Omit<Product, 'id'> & { id?: string; imageUrl?: string; stock: number; }) => void;
  // FIX: Change initialData type to ProductWithStock to correctly access the 'stock' property.
  initialData?: ProductWithStock | null;
  onClose: () => void;
  isSubmitting: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, initialData, onClose, isSubmitting }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [barcode, setBarcode] = useState('');
  const [taxRate, setTaxRate] = useState('0.07');
  const [expiryDate, setExpiryDate] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPrice(initialData.price.toString());
      // FIX: Accessing stock is now valid as initialData is of type ProductWithStock.
      setStock(initialData.stock.toString());
      setCategory(initialData.category);
      setBarcode(initialData.barcode || '');
      setTaxRate(initialData.taxRate?.toString() || '0.07');
      setExpiryDate(initialData.expiryDate || '');
      setImagePreview(initialData.imageUrl);
    } else {
      setName('');
      setPrice('');
      setStock('');
      setCategory('');
      setBarcode('');
      setTaxRate('0.07');
      setExpiryDate('');
      setImagePreview(null);
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Include 'stock' in the productData object and its type definition to resolve the type error.
    const productData: Omit<Product, 'id'> & { id?: string; imageUrl?: string; stock: number; } = {
      ...(initialData && { id: initialData.id }),
      name,
      price: parseFloat(price) || 0,
      stock: parseInt(stock, 10) || 0,
      taxRate: parseFloat(taxRate) || 0,
      category,
      barcode,
      expiryDate: expiryDate || undefined,
      imageUrl: initialData?.imageUrl || '',
    };
    if (imagePreview && imagePreview !== initialData?.imageUrl) {
        productData.imageUrl = imagePreview;
    }
    onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Image</label>
        <div className="mt-1 flex items-center space-x-4">
            <div className="flex-shrink-0">
                {imagePreview ? (
                    <img className="h-20 w-20 rounded-md object-cover" src={imagePreview} alt="Product preview" />
                ) : (
                    <div className="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                        <span className="text-xs text-gray-500">No Image</span>
                    </div>
                )}
            </div>
            <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-cyan-500 border border-gray-300 dark:border-gray-600 px-3 py-2">
                <span>Upload a file</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
            </label>
        </div>
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-900 dark:text-gray-100"
        />
      </div>
       <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          placeholder="e.g., Coffee, Bakery"
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-900 dark:text-gray-100"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
            <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-900 dark:text-gray-100"
            />
        </div>
        <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock</label>
            <input
            type="number"
            id="stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            min="0"
            step="1"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-900 dark:text-gray-100"
            />
        </div>
      </div>
       <div className="grid grid-cols-2 gap-4">
         <div>
            <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tax Rate</label>
            <input
            type="number"
            id="taxRate"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            required
            min="0"
            max="1"
            step="0.01"
            placeholder="e.g., 0.07 for 7%"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-900 dark:text-gray-100"
            />
        </div>
         <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
            <input
                type="date"
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-900 dark:text-gray-100"
            />
         </div>
      </div>
      <div>
        <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Barcode (optional)</label>
        <input
          type="text"
          id="barcode"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-900 dark:text-gray-100"
        />
      </div>
      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-cyan-300 dark:disabled:bg-cyan-800 disabled:cursor-wait">
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Product' : 'Add Product')}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;