import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SlideContent } from './types';
import { generateCarouselText } from './services/geminiService';
import { TopicInputForm } from './components/TopicInputForm';
import { CarouselViewer } from './components/CarouselViewer';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Slide } from './components/Slide';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { ColorPalette, colorMap } from './components/ColorPalette';
import { FontSizeControl } from './components/FontSizeControl';

// TypeScript definitions for libraries loaded via CDN
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

const App: React.FC = () => {
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfLibrariesLoaded, setPdfLibrariesLoaded] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>('bg-slate-800');
  const [fontSize, setFontSize] = useState<string>('md');
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Effect to dynamically load PDF libraries from CDN
  useEffect(() => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(script);
      });
    };

    const loadPdfLibraries = async () => {
      try {
        await Promise.all([
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
        ]);
        setTimeout(() => {
            if (window.jspdf && window.html2canvas) {
                setPdfLibrariesLoaded(true);
            } else {
                 console.error('PDF libraries loaded but not found on window object.');
                 setError('Could not initialize PDF features. Please refresh the page.');
            }
        }, 100);
      } catch (error) {
        console.error('Failed to load PDF generation libraries:', error);
        setError('Could not load PDF features. Please refresh the page.');
      }
    };

    loadPdfLibraries();
  }, []);

  const handleGenerate = useCallback(async (topic: string) => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSlides([]);

    try {
      const textSlides = await generateCarouselText(topic);
      const sortedSlides = textSlides.sort((a, b) => a.slideNumber - b.slideNumber);
      setSlides(sortedSlides);
    } catch (err) {
      console.error(err);
      setError('Failed to generate content. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdateSlide = useCallback((slideNumber: number, updates: Partial<SlideContent>) => {
    setSlides(currentSlides =>
      currentSlides.map(slide =>
        slide.slideNumber === slideNumber ? { ...slide, ...updates } : slide
      )
    );
  }, []);


  const handleDownloadPdf = async () => {
    if (!pdfLibrariesLoaded || !slides.length || !pdfContainerRef.current) {
        setError("Cannot download PDF. Please ensure slides are generated and libraries are ready.");
        return;
    };

    setIsDownloading(true);
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [500, 500],
        });

        const slideElements = pdfContainerRef.current.children;
        const backgroundColorHex = colorMap[selectedColor] || '#1e293b';

        for (let i = 0; i < slideElements.length; i++) {
            const slideElement = slideElements[i] as HTMLElement;
            const canvas = await window.html2canvas(slideElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: backgroundColorHex,
                logging: false,
            });
            const imgData = canvas.toDataURL('image/png');

            if (i > 0) {
                pdf.addPage([500, 500], 'p');
            }
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), undefined, 'FAST');
        }

        pdf.save(`tech-carousel-${Date.now()}.pdf`);
    } catch (err) {
        console.error("Failed to generate PDF:", err);
        setError("Sorry, we couldn't create the PDF. Please try again.");
    } finally {
        setIsDownloading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <header className="py-6 px-4 sm:px-8 text-center border-b border-slate-700">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          AI Tech Carousel Creator
        </h1>
        <p className="mt-2 text-lg text-slate-400">
          Turn any technical topic into an engaging social media carousel.
        </p>
      </header>
      
      <main className="flex-grow container mx-auto p-4 sm:p-8 flex flex-col items-center">
        <div className="w-full max-w-2xl mb-8 bg-slate-800/50 p-6 rounded-lg">
          <TopicInputForm onGenerate={handleGenerate} isLoading={isLoading} />
          <div className="mt-6 flex flex-col sm:flex-row gap-6">
            <ColorPalette selectedColor={selectedColor} onColorChange={setSelectedColor} />
            <FontSizeControl selectedSize={fontSize} onSizeChange={setFontSize} />
          </div>
          {error && <p className="mt-4 text-center text-red-400">{error}</p>}
        </div>

        <div className="w-full flex-grow flex items-center justify-center">
          {isLoading && <LoadingSpinner message={'Generating your carousel...'} />}
          {!isLoading && !error && slides.length > 0 && (
            <div className="flex flex-col items-center gap-6">
                <CarouselViewer 
                  slides={slides} 
                  bgColor={selectedColor}
                  fontSize={fontSize}
                  onUpdateSlide={handleUpdateSlide} 
                />
                 <p className="text-sm text-slate-400 mt-2">
                    💡 Tip: Click on the title or content of a slide to edit the text directly.
                </p>
                <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading || !pdfLibrariesLoaded}
                    className="mt-4 px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                    title={!pdfLibrariesLoaded ? "PDF features are initializing..." : "Download carousel as PDF"}
                >
                    <DownloadIcon />
                    {isDownloading 
                      ? 'Downloading...' 
                      : pdfLibrariesLoaded 
                      ? 'Download as PDF'
                      : 'Loading PDF...'
                    }
                </button>
            </div>
          )}
          {!isLoading && !error && slides.length === 0 && (
            <div className="text-center p-10 border-2 border-dashed border-slate-700 rounded-lg">
              <h2 className="text-2xl font-semibold text-slate-300">Ready to create?</h2>
              <p className="mt-2 text-slate-500">
                Enter a topic above and click "Generate" to see the magic happen!
              </p>
            </div>
          )}
        </div>
      </main>

       {/* Hidden container for rendering slides for PDF generation */}
       {slides.length > 0 && (
        <div className="absolute top-0 left-0 opacity-0 pointer-events-none -z-10" aria-hidden="true">
          <div ref={pdfContainerRef}>
            {slides.map(slide => (
              <div key={`pdf-${slide.slideNumber}`} className="w-[500px] h-[500px] block">
                 <Slide {...slide} isPdfMode={true} bgColor={selectedColor} fontSize={fontSize} />
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="text-center py-4 px-4 sm:px-8 text-slate-500 border-t border-slate-800">
        <p>Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;