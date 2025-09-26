import React from 'react';
import { MinusIcon } from './icons/MinusIcon';
import { PlusIcon } from './icons/PlusIcon';

interface FontSizeControlProps {
  selectedSize: string;
  onSizeChange: (size: string) => void;
}

const fontSizes = [
  { key: 'sm', label: 'Small' },
  { key: 'md', label: 'Medium' },
  { key: 'lg', label: 'Large' },
];

export const FontSizeControl: React.FC<FontSizeControlProps> = ({ selectedSize, onSizeChange }) => {
  const currentIndex = fontSizes.findIndex(size => size.key === selectedSize);
  const currentLabel = fontSizes[currentIndex]?.label || 'Medium';

  const handleDecrease = () => {
    if (currentIndex > 0) {
      onSizeChange(fontSizes[currentIndex - 1].key);
    }
  };

  const handleIncrease = () => {
    if (currentIndex < fontSizes.length - 1) {
      onSizeChange(fontSizes[currentIndex + 1].key);
    }
  };

  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-slate-400 mb-2">
        Adjust font size:
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={currentIndex === 0}
          className="p-2 bg-slate-700 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Decrease font size"
        >
          <MinusIcon />
        </button>
        <div 
            className="w-24 text-center px-4 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300"
            aria-live="polite"
        >
            {currentLabel}
        </div>
        <button
          type="button"
          onClick={handleIncrease}
          disabled={currentIndex === fontSizes.length - 1}
          className="p-2 bg-slate-700 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Increase font size"
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
};