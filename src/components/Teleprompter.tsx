import { useState, useEffect, useRef } from 'react';

interface TeleprompterProps {
  text: string;
}

const Teleprompter = ({ text }: TeleprompterProps) => {
  const [fontSize, setFontSize] = useState(4);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (scrollRef.current && isPlaying) {
          const currentScroll = scrollRef.current.scrollTop;
          const maxScroll = scrollRef.current.scrollHeight - scrollRef.current.clientHeight;

          if (currentScroll < maxScroll) {
            const scrollAmount = isMobile ? speed * 2 : speed * 1;
            scrollRef.current.scrollTop += scrollAmount;
            setScrollPosition(scrollRef.current.scrollTop);
          } else {
            setIsPlaying(false);
          }
        }
      }, 50);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndTime = Date.now();
    const deltaY = touchStartY.current - touchEndY;
    const deltaTime = touchEndTime - touchStartTime.current;

    if (deltaTime < 300 && Math.abs(deltaY) < 10) {
      setShowControls(!showControls);
    }
  };

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
      className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Red line */}
      <div className="absolute top-1/2 left-0 right-0 h-1 sm:h-2 border-y-2 border-red-500 transform -translate-y-1/2 z-10 shadow-lg shadow-red-500/50" />

      <div
        ref={scrollRef}
        className="w-full h-full overflow-y-auto text-center scroll-smooth hide-scrollbar"
        style={{
          fontSize: `${fontSize}rem`,
          lineHeight: 1.8,
          paddingTop: isMobile ? '45vh' : '50vh',
          paddingBottom: isMobile ? '45vh' : '50vh',
          paddingLeft: isMobile ? '1.5rem' : '3rem',
          paddingRight: isMobile ? '1.5rem' : '3rem',
          WebkitOverflowScrolling: 'touch',
        }}
        dir="rtl"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollTop)}
      >
        <div className="text-white leading-relaxed">
          <p className="whitespace-pre-wrap font-medium tracking-wide">{text}</p>
        </div>
      </div>

      {/* Control Panel */}
      {showControls && (
        <div className={`absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 p-3 sm:p-5 rounded-2xl flex flex-col items-center gap-3 sm:gap-4 z-20 shadow-2xl ${
          isMobile ? 'w-11/12 max-w-sm' : 'min-w-96'
        }`}>
          {/* Playback Controls */}
          <div className={`flex items-center gap-3 sm:gap-4 ${isMobile ? 'w-full justify-center' : ''}`}>
            <button
              onClick={togglePlay}
              className={`px-5 sm:px-7 py-3 rounded-xl font-bold transition-all duration-200 text-sm sm:text-base shadow-lg ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/50'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/50'
              }`}
            >
              {isPlaying ? '⏸️ עצור' : '▶️ הפעל'}
            </button>

            <button
              onClick={resetScroll}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-5 py-3 rounded-xl font-bold transition-all duration-200 text-sm sm:text-base shadow-lg shadow-gray-600/50"
            >
              🔄 איפוס
            </button>

            <button
              onClick={toggleFullscreen}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-3 rounded-xl font-bold transition-all duration-200 text-sm sm:text-base shadow-lg shadow-blue-600/50"
            >
              {isFullscreen ? '📱 צא' : '🖥️ מסך מלא'}
            </button>
          </div>

          {/* Speed Control - סליידר */}
          <div className={`flex items-center gap-3 sm:gap-4 ${isMobile ? 'w-full justify-center' : ''}`}>
            <label htmlFor="speed-slider" className="text-sm sm:text-lg font-medium text-gray-200">
              מהירות:
            </label>
            <input
              id="speed-slider"
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className={`cursor-pointer ${isMobile ? 'w-28' : 'w-52'} accent-green-500`}
            />
            <span className="text-white font-bold min-w-10 sm:min-w-14 text-center text-sm sm:text-base bg-gray-700 px-2 py-1 rounded">{speed.toFixed(1)}x</span>
          </div>

          {/* Font Size Control */}
          <div className={`flex items-center gap-3 sm:gap-4 ${isMobile ? 'w-full justify-center' : ''}`}>
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
              className={`cursor-pointer ${isMobile ? 'w-28' : 'w-52'} accent-blue-500`}
            />
            <span className="text-white font-bold min-w-10 sm:min-w-14 text-center text-sm sm:text-base bg-gray-700 px-2 py-1 rounded">{fontSize}rem</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-600 rounded-full h-2 sm:h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 sm:h-3 rounded-full transition-all duration-200 shadow-lg"
              style={{
                width: scrollRef.current
                  ? `${Math.max(0, Math.min(100, (scrollPosition / (scrollRef.current.scrollHeight - scrollRef.current.clientHeight)) * 100))}%`
                  : '0%'
              }}
            />
          </div>

          {/* Mobile Instructions */}
          {isMobile && (
            <div className="text-center text-xs text-gray-300 mt-2 bg-gray-700/50 px-3 py-2 rounded-lg">
              <p>👆 הקש על המסך להצגת/הסתרת כפתורים</p>
              <p>⌨️ השתמש ברווח להפעלה/עצירה</p>
              <p className="text-green-400 font-medium">📱 סליידר מהירות מותאם לטלפון</p>
            </div>
          )}
        </div>
      )}

      {/* Mobile Tap Indicator */}
      {isMobile && !showControls && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 z-10 border border-gray-600/50 shadow-2xl">
          <div className="text-white text-center">
            <div className="text-3xl mb-2">👆</div>
            <div className="text-sm font-medium">הקש להצגת כפתורים</div>
          </div>
        </div>
      )}

      {/* Status indicator */}
      {isPlaying && (
        <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg z-10 animate-pulse">
          🔴 LIVE - גלילה פעילה
        </div>
      )}
    </div>
  );
};

export default Teleprompter;
