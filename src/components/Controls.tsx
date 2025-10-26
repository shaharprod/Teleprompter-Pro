import { useState, useEffect } from 'react';
import { DisplayIcon } from './icons';

interface ControlsProps {
  onSubmit: (script: string) => void;
}

const Controls = ({ onSubmit }: ControlsProps) => {
  const [script, setScript] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // זיהוי טלפון נייד
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(script);
  };

  const clearScript = () => {
    setScript('');
    onSubmit('');
  };

  const loadSampleScript = () => {
    const sampleText = `ברוכים הבאים לטלפרומפטר המקצועי! 🎬

זהו דוגמה לסקריפט שתוכלו להשתמש בו.
הטלפרומפטר כולל כפתורי שליטה מתקדמים:

▶️ הפעל - להתחלת הגלילה האוטומטית
⏸️ עצור - לעצירת הגלילה
🔄 איפוס - לחזרה לתחילת הטקסט
🖥️ מסך מלא - למצב מסך מלא

תוכלו לשלוט במהירות הגלילה ובגודל הגופן.
הקו האדום במרכז המסך עוזר לכם לעקוב אחר הטקסט.

בהצלחה בהקלטה! 🎥`;
    setScript(sampleText);
  };

  return (
    <div className={`mx-auto ${isMobile ? 'px-3 max-w-full' : 'max-w-5xl'}`}>
      {/* Main Controls - עיצוב משופר */}
      <form onSubmit={handleSubmit} className={`flex gap-3 sm:gap-4 items-start mb-4 ${isMobile ? 'flex-col' : ''}`}>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="הדביקו את הסקריפט שלכם כאן או כתבו אחד חדש..."
          className={`flex-grow bg-gray-700/90 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-right resize-none ${
            isExpanded ? 'h-40 sm:h-56' : 'h-20 sm:h-28'
          } ${isMobile ? 'w-full text-sm' : ''} backdrop-blur-sm shadow-lg`}
          aria-label="הזינו סקריפט"
        />
        <div className={`flex gap-2 ${isMobile ? 'w-full justify-center' : 'flex-col'}`}>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 h-12 sm:h-14 text-sm sm:text-base shadow-lg shadow-blue-600/50"
            aria-live="polite"
          >
            <DisplayIcon />
            <span className="hidden sm:inline">הצג סקריפט</span>
            <span className="sm:hidden">הצג</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-xs sm:text-sm transition-all duration-200 shadow-md"
          >
            {isExpanded ? '📝 קטן' : '📝 גדל'}
          </button>
        </div>
      </form>

      {/* Additional Controls - עיצוב משופר */}
      <div className={`flex flex-wrap gap-2 sm:gap-3 justify-center ${isMobile ? 'gap-2' : ''}`}>
        <button
          onClick={loadSampleScript}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-xs sm:text-sm shadow-lg shadow-green-600/50"
        >
          📄 דוגמה
        </button>

        <button
          onClick={clearScript}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-xs sm:text-sm shadow-lg shadow-red-600/50"
        >
          🗑️ נקה
        </button>

        <button
          onClick={() => navigator.clipboard.writeText(script)}
          disabled={!script}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-xs sm:text-sm shadow-lg shadow-purple-600/50"
        >
          📋 העתק
        </button>
      </div>

      {/* Instructions - עיצוב משופר */}
      <div className={`mt-4 text-center ${isMobile ? 'text-xs px-2' : 'text-sm'} bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-600/30`}>
        <p className="text-gray-300 font-medium">💡 טיפ: השתמשו בכפתורי השליטה בטלפרומפטר לשליטה מלאה בהקלטה</p>
        {isMobile && (
          <p className="mt-2 text-gray-400">📱 מותאם לטלפון נייד - הקש על המסך להצגת כפתורים</p>
        )}
      </div>
    </div>
  );
};

export default Controls;
