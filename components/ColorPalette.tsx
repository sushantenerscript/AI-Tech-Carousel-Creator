import React from 'react';

interface ColorOption {
  name: string;
  className: string;
}

const colors: ColorOption[] = [
  { name: 'Slate', className: 'bg-slate-800' },
  { name: 'Sky', className: 'bg-sky-900' },
  { name: 'Indigo', className: 'bg-indigo-900' },
  { name: 'Teal', className: 'bg-teal-900' },
  { name: 'Rose', className: 'bg-rose-900' },
  { name: 'White', className: 'bg-white' },
];

export const colorMap: { [key: string]: string } = {
    'bg-slate-800': '#1e293b',
    'bg-sky-900': '#0c4a6e',
    'bg-indigo-900': '#312e81',
    'bg-teal-900': '#134e4a',
    'bg-rose-900': '#881337',
    'bg-white': '#ffffff',
};


interface ColorPaletteProps {
  selectedColor: string;
  onColorChange: (className: string) => void;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ selectedColor, onColorChange }) => {
  return (
    <div className="flex-1">
        <label className="block text-sm font-medium text-slate-400 mb-2">
            Choose a background color:
        </label>
        <div className="flex items-center gap-3">
            {colors.map((color) => (
                <button
                    key={color.name}
                    type="button"
                    onClick={() => onColorChange(color.className)}
                    className={`w-8 h-8 rounded-full transition-transform duration-200 border border-slate-500/50 ${color.className} ${
                        selectedColor === color.className 
                        ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-sky-400' 
                        : 'hover:scale-110'
                    }`}
                    aria-label={`Select ${color.name} color`}
                    title={color.name}
                />
            ))}
        </div>
    </div>
  );
};