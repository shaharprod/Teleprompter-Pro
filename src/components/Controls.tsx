import { useState } from 'react';
import { DisplayIcon } from './icons';

interface ControlsProps {
  onSubmit: (script: string) => void;
}

const Controls = ({ onSubmit }: ControlsProps) => {
  const [script, setScript] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // זיהוי טלפון נייד
  useState(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(script);
  };

  const clearScript = () => {
    setScript('');
    onSubmit('');
  };

  const loadSampleScript = () => {
    const sampleText = `ברוכים הבאים לטלפרומפטר המקצועי!

זהו דוגמה לסקריפט שתוכלו להשתמש בו.
הטלפרומפטר כולל כפתורי שליטה מתקדמים:

▶️ הפעל - להתחלת הגלילה האוטומטית
⏸️ עצור - לעצירת הגלילה
🔄 איפוס - לחזרה לתחילת הטקסט
🖥️ מסך מלא - למצב מסך מלא

תוכלו לשלוט במהירות הגלילה ובגודל הגופן.
הקו האדום במרכז המסך עוזר לכם לעקוב אחר הטקסט.

בהצלחה בהקלטה!`;
    setScript(sampleText);
  };

  return (
    <div className={`mx-auto ${isMobile ? 'px-2 max-w-full' : 'max-w-4xl'}`}>
      {/* Main Controls */}
      <form onSubmit={handleSubmit} className={`flex gap-2 sm:gap-4 items-start mb-4 ${isMobile ? 'flex-col' : ''}`}>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="הדביקו את הסקריפט שלכם כאן או כתבו אחד חדש..."
          className={`flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 sm:px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-right resize-none transition-all duration-300 ${
            isExpanded ? 'h-32 sm:h-48' : 'h-16 sm:h-24'
          } ${isMobile ? 'w-full text-sm' : ''}`}
          aria-label="הזינו סקריפט"
        />
        <div className={`flex gap-2 ${isMobile ? 'w-full justify-center' : 'flex-col'}`}>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 h-10 sm:h-12 text-sm sm:text-base"
            aria-live="polite"
          >
            <DisplayIcon />
            <span className="hidden sm:inline">הצג סקריפט</span>
            <span className="sm:hidden">הצג</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs sm:text-sm transition-colors"
          >
            {isExpanded ? '📝 קטן' : '📝 גדל'}
          </button>
        </div>
      </form>

      {/* Additional Controls */}
      <div className={`flex flex-wrap gap-2 justify-center ${isMobile ? 'gap-1' : ''}`}>
        <button
          onClick={loadSampleScript}
          className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
        >
          📄 דוגמה
        </button>

        <button
          onClick={clearScript}
          className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
        >
          🗑️ נקה
        </button>

        <button
          onClick={() => navigator.clipboard.writeText(script)}
          disabled={!script}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-3 sm:px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
        >
          📋 העתק
        </button>
      </div>

      {/* Instructions */}
      <div className={`mt-4 text-center text-gray-400 ${isMobile ? 'text-xs px-2' : 'text-sm'}`}>
        <p>💡 טיפ: השתמשו בכפתורי השליטה בטלפרומפטר לשליטה מלאה בהקלטה</p>
        {isMobile && (
          <p className="mt-1">📱 מותאם לטלפון נייד - הקש על המסך להצגת כפתורים</p>
        )}
      </div>
    </div>
  );
};

export default Controls;
