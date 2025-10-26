import { useState, useEffect } from 'react';
import Controls from './components/Controls';
import Teleprompter from './components/Teleprompter';

const App = () => {
  const [text, setText] = useState<string>(
    'ברוכים הבאים לטלפרומפטר המקצועי! הזינו את הטקסט שלכם למטה ולחצו על \'הצג סקריפט\' כדי להתחיל. השתמשו בכפתורי השליטה לשליטה מלאה בהקלטה.'
  );
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

  const handleTextSubmit = (scriptText: string) => {
    setText(scriptText);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <header className={`bg-gray-800 p-3 sm:p-4 shadow-lg z-10 ${isMobile ? 'text-center' : ''}`}>
        <h1 className={`font-bold text-center tracking-wider ${isMobile ? 'text-xl' : 'text-3xl'}`}>
          🎬 טלפרומפטר מקצועי
        </h1>
        <p className={`text-center text-gray-300 mt-1 sm:mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          כלי מקצועי להקלטת וידאו עם שליטה מלאה
        </p>
        {isMobile && (
          <p className="text-xs text-gray-400 mt-1">
            📱 מותאם לטלפון נייד
          </p>
        )}
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
        <Teleprompter text={text} />
      </main>
      <footer className={`bg-gray-800 p-2 sm:p-4 border-t border-gray-700 ${isMobile ? 'pb-4' : ''}`}>
        <Controls onSubmit={handleTextSubmit} />
      </footer>
    </div>
  );
};

export default App;
