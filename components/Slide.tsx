import React, { useState } from 'react';
import { SlideContent } from '../types';
import { CopyIcon } from './icons/CopyIcon';

interface SlideProps extends SlideContent {
  isPdfMode?: boolean;
  bgColor: string;
  fontSize?: string;
  onUpdateSlide?: (slideNumber: number, updates: Partial<SlideContent>) => void;
}

const parseContent = (text: string) => {
  const boldedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return { __html: boldedText };
};

export const Slide: React.FC<SlideProps> = ({ title, content, slideNumber, isPdfMode = false, bgColor, fontSize = 'md', onUpdateSlide }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainContent = tempDiv.textContent || tempDiv.innerText || "";
    
    navigator.clipboard.writeText(`${title}\n\n${plainContent}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleTitleBlur = (e: React.FocusEvent<HTMLHeadingElement>) => {
    onUpdateSlide?.(slideNumber, { title: e.currentTarget.innerText });
  };
  
  const handleContentBlur = (e: React.FocusEvent<HTMLParagraphElement>) => {
    onUpdateSlide?.(slideNumber, { content: e.currentTarget.innerHTML });
  };

  const isLightBg = bgColor === 'bg-white';
  const copyButtonBg = isLightBg ? 'bg-slate-200 hover:bg-slate-300' : 'bg-slate-700 hover:bg-slate-600';
  const slideNumberColor = isLightBg ? 'text-slate-400' : 'text-slate-500';
  
  const editableStyles = !isPdfMode 
    ? 'cursor-text focus:outline-none focus:ring-2 focus:ring-sky-400/80 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-sm' 
    : '';

  const titleColor = isLightBg ? 'text-sky-600' : 'text-sky-400';
  const contentColor = isLightBg ? 'text-slate-700' : 'text-slate-300';

  const titleSizeClasses: { [key: string]: string } = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  const contentSizeClasses: { [key: string]: string } = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  // For PDF mode, remove scroll/height constraints to make all content visible for capture.
  const contentContainerClasses = isPdfMode ? '' : 'overflow-y-auto max-h-60';
  
  // For PDF mode, reduce padding slightly to give content more space and prevent clipping.
  const slidePaddingClass = isPdfMode ? 'p-6' : 'p-8';


  return (
    <div className={`aspect-square w-full ${bgColor} border border-slate-700 flex flex-col justify-center items-center text-center ${slidePaddingClass} relative overflow-hidden`}>
      {!isPdfMode && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={handleCopy}
            className={`px-3 py-2 ${copyButtonBg} rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${isLightBg ? 'text-slate-800' : 'text-white'}`}
          >
            <CopyIcon />
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      
      <div className="w-full max-w-md">
          <h2 
              className={`font-bold ${titleColor} mb-4 ${editableStyles} ${titleSizeClasses[fontSize]}`}
              onBlur={handleTitleBlur}
              contentEditable={!isPdfMode}
              suppressContentEditableWarning={true}
          >
              {title}
          </h2>
          <div 
              className={`${contentColor} whitespace-pre-wrap ${editableStyles} ${contentContainerClasses} ${contentSizeClasses[fontSize]}`}
              onBlur={handleContentBlur}
              contentEditable={!isPdfMode}
              suppressContentEditableWarning={true}
              dangerouslySetInnerHTML={parseContent(content)} 
          />
      </div>
      
      {!isPdfMode && (
         <div className={`absolute bottom-4 left-4 text-sm ${slideNumberColor} z-20`}>
          Slide {slideNumber}
        </div>
      )}
    </div>
  );
};