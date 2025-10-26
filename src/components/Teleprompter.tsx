import { useState, useEffect, useRef } from 'react';

interface TeleprompterProps {
  text: string;
}

const Teleprompter = ({ text }: TeleprompterProps) => {
  const [fontSize, setFontSize] = useState(4); // קטן יותר לטלפון
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  // זיהוי טלפון נייד
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (isPlaying && scrollRef.current) {
      const scroll = () => {
        if (scrollRef.current) {
          const currentScroll = scrollRef.current.scrollTop;
          const maxScroll = scrollRef.current.scrollHeight - scrollRef.current.clientHeight;

          if (currentScroll < maxScroll) {
            scrollRef.current.scrollTop += speed * (isMobile ? 0.3 : 0.5);
            setScrollPosition(scrollRef.current.scrollTop);
            animationRef.current = requestAnimationFrame(scroll);
          } else {
            setIsPlaying(false);
          }
        }
      };
      animationRef.current = requestAnimationFrame(scroll);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, speed, isMobile]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetScroll = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setScrollPosition(0);
      setIsPlaying(false);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log('Fullscreen not supported');
    }
  };

  const adjustSpeed = (newSpeed: number) => {
    setSpeed(Math.max(0.1, Math.min(5, newSpeed)));
  };

  // שליטה במגע
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();
    const deltaY = touchStartY.current - touchEndY;
    const deltaTime = touchEndTime - touchStartTime.current;

    // אם זה tap קצר - הצג/הסתר כפתורים
    if (deltaTime < 300 && Math.abs(deltaY) < 10) {
      setShowControls(!showControls);
    }
  };

  // שליטה במקלדת
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          }
          break;
        case 'Home':
          resetScroll();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center bg-gray-900 relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Red line to guide the reader */}
      <div className="absolute top-1/2 left-0 right-0 h-1 sm:h-2 border-y border-red-500 transform -translate-y-1/2 z-10" />

      <div
        ref={scrollRef}
        className="w-full h-full overflow-y-auto text-center scroll-smooth"
        style={{
          fontSize: `${fontSize}rem`,
          lineHeight: 1.6,
          paddingTop: isMobile ? '40vh' : '50vh',
          paddingBottom: isMobile ? '40vh' : '50vh',
          paddingLeft: isMobile ? '1rem' : '2.5rem',
          paddingRight: isMobile ? '1rem' : '2.5rem',
        }}
        dir="rtl"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollTop)}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
      </div>

      {/* Control Panel - מותאם לטלפון */}
      {showControls && (
        <div className={`absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 bg-opacity-95 p-2 sm:p-4 rounded-xl flex flex-col items-center gap-2 sm:gap-4 z-20 ${
          isMobile ? 'w-11/12 max-w-sm' : 'min-w-96'
        }`}>
          {/* Playback Controls */}
          <div className={`flex items-center gap-2 sm:gap-4 ${isMobile ? 'w-full justify-center' : ''}`}>
            <button
              onClick={togglePlay}
              className={`px-4 sm:px-6 py-2 rounded-lg font-bold transition-colors text-sm sm:text-base ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              aria-label={isPlaying ? 'עצור' : 'הפעל'}
            >
              {isPlaying ? '⏸️ עצור' : '▶️ הפעל'}
            </button>

            <button
              onClick={resetScroll}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg font-bold transition-colors text-sm sm:text-base"
              aria-label="איפוס"
            >
              🔄 איפוס
            </button>

            <button
              onClick={toggleFullscreen}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-bold transition-colors text-sm sm:text-base"
              aria-label="מסך מלא"
            >
              {isFullscreen ? '📱 צא' : '🖥️ מסך מלא'}
            </button>
          </div>

          {/* Speed Control */}
          <div className={`flex items-center gap-2 sm:gap-4 ${isMobile ? 'w-full justify-center' : ''}`}>
            <label className="text-sm sm:text-lg font-medium text-gray-200">מהירות:</label>
            <button
              onClick={() => adjustSpeed(speed - 0.1)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-2 sm:px-3 py-1 rounded transition-colors text-sm"
              disabled={speed <= 0.1}
            >
              -
            </button>
            <span className="text-white font-bold min-w-8 sm:min-w-12 text-center text-sm sm:text-base">{speed.toFixed(1)}x</span>
            <button
              onClick={() => adjustSpeed(speed + 0.1)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-2 sm:px-3 py-1 rounded transition-colors text-sm"
              disabled={speed >= 5}
            >
              +
            </button>
          </div>

          {/* Font Size Control */}
          <div className={`flex items-center gap-2 sm:gap-4 ${isMobile ? 'w-full justify-center' : ''}`}>
            <label htmlFor="font-size-slider" className="text-sm sm:text-lg font-medium text-gray-200">
              גופן:
            </label>
            <input
              id="font-size-slider"
              type="range"
              min="2"
              max={isMobile ? "8" : "12"}
              step="0.5"
              value={fontSize}
              onChange={(e) => setFontSize(parseFloat(e.target.value))}
              className={`cursor-pointer ${isMobile ? 'w-24' : 'w-48'}`}
              aria-label="שנה גודל גופן"
            />
            <span className="text-white font-bold min-w-8 sm:min-w-12 text-center text-sm sm:text-base">{fontSize}rem</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-600 rounded-full h-1 sm:h-2">
            <div
              className="bg-blue-500 h-1 sm:h-2 rounded-full transition-all duration-100"
              style={{
                width: scrollRef.current
                  ? `${(scrollPosition / (scrollRef.current.scrollHeight - scrollRef.current.clientHeight)) * 100}%`
                  : '0%'
              }}
            />
          </div>

          {/* Mobile Instructions */}
          {isMobile && (
            <div className="text-center text-xs text-gray-400 mt-1">
              <p>👆 הקש על המסך להצגת/הסתרת כפתורים</p>
              <p>⌨️ השתמש ברווח להפעלה/עצירה</p>
            </div>
          )}
        </div>
      )}

      {/* Mobile Tap Indicator */}
      {isMobile && !showControls && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 rounded-full p-4 z-10">
          <div className="text-white text-center">
            <div className="text-2xl">👆</div>
            <div className="text-xs mt-1">הקש להצגת כפתורים</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teleprompter;
