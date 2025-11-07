
import React from 'react';
import { ProductWithStock } from '../types';
import { PencilIcon, TrashIcon, WarningIcon, RestockIcon, BarcodeIcon } from './icons';
import { formatCurrency } from '../utils/formatting';

interface ProductCardProps {
  product: ProductWithStock;
  onAddToCart: (product: ProductWithStock) => void;
  onEdit: (product: ProductWithStock) => void;
  onDelete: (productId: string) => void;
  onRestock: (product: ProductWithStock) => void;
  isAdmin: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onEdit, onDelete, onRestock, isAdmin }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day for accurate comparison

  const expiry = product.expiryDate ? new Date(product.expiryDate) : null;
  const isExpired = expiry ? expiry < today : false;
  
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);
  const isExpiringSoon = expiry ? !isExpired && expiry <= sevenDaysFromNow : false;

  const isLowStock = product.stock > 0 && product.stock <= 10;
  
  const stockColor = product.stock > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 
                     isLowStock ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 
                     'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(product.id);
  }

  const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(product);
  }

  const handleRestock = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRestock(product);
  }

  const handleCardClick = () => {
    if (!isExpired && product.stock > 0) {
      onAddToCart(product);
    }
  }

  return (
    <div 
      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col ${isExpired ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={handleCardClick}
    >
      <div className="relative">
        <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
        {isExpired && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span className="text-white text-xl font-bold border-2 border-red-400 text-red-400 px-4 py-2 rounded uppercase tracking-widest">Expired</span>
            </div>
        )}
        {product.stock === 0 && !isExpired && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white text-lg font-bold">Out of Stock</span>
          </div>
        )}
        {isExpiringSoon && !isExpired && (
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                <WarningIcon className="w-3 h-3"/>
                Expires Soon
            </span>
        )}
        {isAdmin && (
            <div className="absolute top-2 right-2 flex space-x-2">
            <button onClick={handleRestock} title="Restock" className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600">
                <RestockIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>
            <button onClick={handleEdit} title="Edit" className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600">
                <PencilIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button onClick={handleDelete} title="Delete" className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600">
                <TrashIcon className="w-4 h-4 text-red-500" />
            </button>
            </div>
        )}
         <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded">
          {product.category}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">{product.name}</h3>
        
        {product.barcode && (
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mt-1">
                <BarcodeIcon className="w-4 h-4"/>
                <span>{product.barcode}</span>
            </div>
        )}
        
        {product.expiryDate && (
             <p className={`text-xs mt-1 font-medium ${isExpired ? 'text-red-500' : isExpiringSoon ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}`}>
                Expires: {new Date(product.expiryDate).toLocaleDateString()}
            </p>
        )}


        <div className="flex-grow"></div>
        <div className="mt-2 flex justify-between items-center">
          <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">{formatCurrency(product.price)}</p>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${stockColor} flex items-center gap-1`}>
            {isLowStock && !isExpired && <WarningIcon className="w-3 h-3" />}
            <span>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;