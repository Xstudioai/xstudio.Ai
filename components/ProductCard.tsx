import React from 'react';
import { Product } from '../types';
import { ShoppingCart, Info } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAskDetails: (product: Product) => void;
  disabled: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAskDetails, disabled }) => {
  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 hover:border-sky-500 transition-all duration-300 flex flex-col group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-sky-400 font-bold">
          ${product.price}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="mt-auto flex gap-2">
          <button 
            onClick={() => onAskDetails(product)}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors
              ${disabled 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
          >
            <Info size={16} />
            Preguntar
          </button>
          
          <button 
            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            title="Añadir al carrito (Demo)"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
