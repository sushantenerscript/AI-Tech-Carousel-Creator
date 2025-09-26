import React, { useState } from 'react';
import { SlideContent } from '../types';
import { Slide } from './Slide';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface CarouselViewerProps {
  slides: SlideContent[];
  bgColor: string;
  fontSize: string;
  onUpdateSlide: (slideNumber: number, updates: Partial<SlideContent>) => void;
}

export const CarouselViewer: React.FC<CarouselViewerProps> = ({ slides, bgColor, fontSize, onUpdateSlide }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };
  
  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className="w-full max-w-lg mx-auto relative">
      <div className="overflow-hidden rounded-lg shadow-2xl shadow-sky-900/20">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.slideNumber} className="w-full flex-shrink-0">
              <Slide {...slide} bgColor={bgColor} fontSize={fontSize} onUpdateSlide={onUpdateSlide} />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={goToPrevious}
        className="absolute top-1/2 -translate-y-1/2 -left-12 p-2 rounded-full bg-slate-700/50 hover:bg-slate-600 transition-colors"
      >
        <ChevronLeftIcon />
      </button>
      <button
        onClick={goToNext}
        className="absolute top-1/2 -translate-y-1/2 -right-12 p-2 rounded-full bg-slate-700/50 hover:bg-slate-600 transition-colors"
      >
        <ChevronRightIcon />
      </button>
      
      <div className="flex justify-center items-center mt-4 space-x-2">
        {slides.map((_, slideIndex) => (
            <button
                key={slideIndex}
                onClick={() => goToSlide(slideIndex)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentIndex === slideIndex ? 'bg-sky-500 scale-125' : 'bg-slate-600 hover:bg-slate-500'
                }`}
                aria-label={`Go to slide ${slideIndex + 1}`}
            />
        ))}
      </div>
    </div>
  );
};