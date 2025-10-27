import React, { useState, useEffect, useRef } from 'react'
import VideoRecorder from './components/VideoRecorder'
import VideoPreview from './components/VideoPreview'

interface TeleprompterProps {
  text: string
  isPlaying: boolean
  speed: number
  fontSize: number
  onTogglePlay: () => void
  onSpeedChange: (speed: number) => void
  onFontSizeChange: (size: number) => void
  onReset: () => void
}

const Teleprompter: React.FC<TeleprompterProps> = ({
  text,
  isPlaying,
  speed,
  fontSize,
  onTogglePlay,
  onSpeedChange,
  onFontSizeChange
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto scroll
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (isPlaying && scrollRef.current) {
      intervalRef.current = setInterval(() => {
        if (scrollRef.current) {
          const currentScroll = scrollRef.current.scrollTop
          const maxScroll = scrollRef.current.scrollHeight - scrollRef.current.clientHeight

          if (currentScroll < maxScroll) {
            const scrollAmount = isMobile ? speed * 3 : speed * 2 // Better mobile/desktop ratio
            scrollRef.current.scrollTop += scrollAmount
            setScrollPosition(scrollRef.current.scrollTop)
          } else {
            onTogglePlay()
          }
        }
      }, 16) // 60 FPS for smoother scrolling
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, speed, isMobile, onTogglePlay])

  // Reset scroll when text changes or when stopped
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
      setScrollPosition(0)
    }
  }, [text])

  // Reset scroll when stopped (for reset button)
  useEffect(() => {
    if (!isPlaying && scrollRef.current) {
      scrollRef.current.scrollTop = 0
      setScrollPosition(0)
    }
  }, [isPlaying])

  // Touch controls
  const handleTouchStart = () => {
    setShowControls(true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    // If touch is in center area, toggle play
    if (x > rect.width * 0.2 && x < rect.width * 0.8 && y > rect.height * 0.2 && y < rect.height * 0.8) {
      onTogglePlay()
    }
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
        onTogglePlay()
      } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onTogglePlay])

  const maxScroll = scrollRef.current ? scrollRef.current.scrollHeight - scrollRef.current.clientHeight : 1
  const progress = maxScroll > 0 ? (scrollPosition / maxScroll) * 100 : 0

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden"
         onTouchStart={handleTouchStart}
         onTouchEnd={handleTouchEnd}>

      {/* Red line */}
      <div className="absolute top-1/2 left-0 right-0 h-1 border-y-2 border-red-500 shadow-red-glow transform -translate-y-1/2 z-10" />

      {/* Text area */}
      <div
        ref={scrollRef}
        className="w-full h-full overflow-y-scroll p-4 text-center scroll-smooth"
        style={{
          fontSize: `${fontSize}rem`,
          lineHeight: 1.5,
          paddingTop: '50vh',
          paddingBottom: '50vh',
          WebkitOverflowScrolling: 'touch'
        }}
        dir="rtl"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollTop)}
      >
        <p className="whitespace-pre-wrap">{text}</p>
      </div>

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 backdrop-blur-lg p-4 rounded-t-xl flex flex-col items-center gap-4 z-20 transition-transform duration-300 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}>

        {isPlaying && (
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-red-500 text-sm font-bold animate-pulse">
            🔴 LIVE
          </span>
        )}

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-4 w-full max-w-md">
          <label className="text-sm font-medium text-gray-200 min-w-16">
            מהירות:
          </label>
          <input
            type="range"
            min="0.05"
            max="50"
            step="0.1"
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="flex-1 cursor-pointer accent-green-500"
          />
          <span className="text-white font-bold min-w-12 text-center bg-gray-700 px-2 py-1 rounded">
            {speed.toFixed(1)}x
          </span>
        </div>

        {/* Font size control */}
        <div className="flex items-center gap-4 w-full max-w-md">
          <label className="text-sm font-medium text-gray-200 min-w-16">
            גופן:
          </label>
          <input
            type="range"
            min="2"
            max="12"
            step="0.5"
            value={fontSize}
            onChange={(e) => onFontSizeChange(parseFloat(e.target.value))}
            className="flex-1 cursor-pointer accent-blue-500"
          />
          <span className="text-white font-bold min-w-12 text-center bg-gray-700 px-2 py-1 rounded">
            {fontSize}rem
          </span>
        </div>

        {/* Mobile instructions */}
        {isMobile && (
          <p className="text-xs text-gray-400 text-center">
            הקש על המסך כדי להפעיל/להשהות. הקש על הקצוות כדי להציג/להסתיר פקדים.
          </p>
        )}
      </div>
    </div>
  )
}

const App: React.FC = () => {
  const [text, setText] = useState<string>('ברוכים הבאים לטלפרומפטר מקצועי. הזינו את הטקסט שלכם למטה ולחצו על \'הצג סקריפט\' כדי להתחיל.')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [fontSize, setFontSize] = useState(4)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Video recording states
  const [isRecording, setIsRecording] = useState(false)
  const [showVideoRecorder, setShowVideoRecorder] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null)
  const [showVideoPreview, setShowVideoPreview] = useState(false)

  // Screen width control states
  const [screenSplitRatio, setScreenSplitRatio] = useState(50) // 0-100, where 50 is equal split

  const handleTextSubmit = (scriptText: string) => {
    setText(scriptText)
    setIsPlaying(false)
    setFontSize(4)
    setSpeed(1)
  }

  const togglePlay = () => setIsPlaying(prev => !prev)

  const resetScroll = () => {
    setIsPlaying(false)
    // The Teleprompter component will handle the actual scroll reset
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.log('Fullscreen not supported')
    }
  }

  const adjustSpeed = (newSpeed: number) => setSpeed(Math.max(0.01, Math.min(100, newSpeed)))
  const adjustFontSize = (newSize: number) => setFontSize(Math.max(2, Math.min(12, newSize)))

  // Video recording functions
  const handleStartRecording = () => {
    setIsRecording(true)
  }

  const handleStopRecording = () => {
    setIsRecording(false)
  }

  const handleVideoReady = (videoBlob: Blob) => {
    setRecordedVideo(videoBlob)
    setShowVideoRecorder(false)
    setShowVideoPreview(true)
  }

  const handleSaveVideo = () => {
    setShowVideoPreview(false)
    setRecordedVideo(null)
  }

  const handleCancelVideo = () => {
    setShowVideoPreview(false)
    setRecordedVideo(null)
  }

  const handleRecordAgain = () => {
    setShowVideoPreview(false)
    setRecordedVideo(null)
    setShowVideoRecorder(true)
  }

  const toggleVideoRecorder = () => {
    if (showVideoRecorder) {
      setShowVideoRecorder(false)
    } else {
      setShowVideoRecorder(true)
      // Don't stop teleprompter when recording starts
    }
  }

  // Screen split control functions
  const getScreenSplitStyles = () => {
    const teleprompterWidth = screenSplitRatio
    const cameraWidth = 100 - screenSplitRatio

    return {
      teleprompter: { width: `${teleprompterWidth}%` },
      camera: { width: `${cameraWidth}%` }
    }
  }

  const adjustScreenSplit = (ratio: number) => {
    setScreenSplitRatio(Math.max(10, Math.min(90, ratio))) // Limit between 10% and 90%
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-gray-800 bg-opacity-70 backdrop-blur-lg p-4 shadow-lg z-10 border-b border-gray-700">
        <h1 className="text-3xl font-bold text-center tracking-wider text-blue-400">
          טלפרומפטר מקצועי
        </h1>
        {showVideoRecorder && (
          <div className="text-center mt-2">
            <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mr-2">
              🤳 מצב סלפי פעיל - פורמט אנכי לרשתות חברתיות
            </span>
            <span className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold">
              📐 טלפרומפטר: {screenSplitRatio}% | מצלמה: {100 - screenSplitRatio}%
            </span>
          </div>
        )}
      </header>

          {/* Main content */}
          <main className="flex-grow flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden relative">
            {/* Desktop Controls - Bottom overlay - UPDATED */}
            {!isMobile && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-gray-800 bg-opacity-95 backdrop-blur-lg p-4 rounded-2xl shadow-2xl border border-gray-600">
                <div className="flex items-center gap-8">
                  {/* Speed Control */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-bold text-gray-100 min-w-20">
                      מהירות גלילה:
                    </label>
                    <input
                      type="range"
                      min="0.01"
                      max="100"
                      step="0.1"
                      value={speed}
                      onChange={(e) => adjustSpeed(parseFloat(e.target.value))}
                      className="cursor-pointer w-32 accent-green-500"
                      aria-label="שנה מהירות גלילה"
                    />
                    <span className="text-green-400 font-bold text-sm bg-gray-700 px-2 py-1 rounded min-w-12 text-center">
                      {speed.toFixed(1)}x
                    </span>
                  </div>

                  {/* Font Size Control */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-bold text-gray-100 min-w-16">
                      גודל גופן:
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="12"
                      step="0.5"
                      value={fontSize}
                      onChange={(e) => adjustFontSize(parseFloat(e.target.value))}
                      className="cursor-pointer w-32 accent-blue-500"
                      aria-label="שנה גודל גופן"
                    />
                    <span className="text-blue-400 font-bold text-sm bg-gray-700 px-2 py-1 rounded min-w-12 text-center">
                      {fontSize}rem
                    </span>
                  </div>
                </div>
              </div>
            )}
        {showVideoPreview && recordedVideo ? (
          <VideoPreview
            videoBlob={recordedVideo}
            onSave={handleSaveVideo}
            onCancel={handleCancelVideo}
            onRecordAgain={handleRecordAgain}
          />
        ) : showVideoRecorder ? (
          <div className="w-full h-full flex gap-4">
            {/* Left side - Teleprompter */}
            <div className="h-full" style={getScreenSplitStyles().teleprompter}>
              <Teleprompter
                text={text}
                isPlaying={isPlaying}
                speed={speed}
                fontSize={fontSize}
                onTogglePlay={togglePlay}
                onSpeedChange={adjustSpeed}
                onFontSizeChange={adjustFontSize}
                onReset={resetScroll}
              />
            </div>

            {/* Right side - Video Recorder */}
            <div className="h-full flex flex-col items-center justify-center" style={getScreenSplitStyles().camera}>
              <VideoRecorder
                isRecording={isRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                onVideoReady={handleVideoReady}
              />
            </div>
          </div>
        ) : (
          <Teleprompter
            text={text}
            isPlaying={isPlaying}
            speed={speed}
            fontSize={fontSize}
            onTogglePlay={togglePlay}
            onSpeedChange={adjustSpeed}
            onFontSizeChange={adjustFontSize}
            onReset={resetScroll}
          />
        )}
      </main>

      {/* Footer controls */}
      <footer className="bg-gray-800 bg-opacity-70 backdrop-blur-lg p-3 sm:p-4 border-t border-gray-700 z-10">
        <div className="max-w-4xl mx-auto w-full">
          {/* Text input */}
          <form onSubmit={(e) => { e.preventDefault(); handleTextSubmit(text) }} className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center mb-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="הדביקו את הסקריפט שלכם כאן או כתבו אחד חדש..."
              className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-right resize-none h-24 sm:h-32 w-full"
            />
            <div className="flex flex-col gap-2 sm:gap-4 h-24 sm:h-32">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 h-1/2 w-full sm:w-auto min-h-[44px]"
              >
                <span>📺</span>
                <span className="hidden sm:inline">הצג סקריפט</span>
              </button>
              <div className="flex gap-2 sm:gap-4 h-1/2 w-full">
                <button
                  type="button"
                  onClick={() => {
                    const exampleText = 'זהו טקסט לדוגמה עבור הטלפרומפטר. ניתן להשתמש בו כדי לבדוק את מהירות הגלילה וגודל הגופן. נסו לשנות את ההגדרות ולראות איך זה משפיע על התצוגה. הטלפרומפטר הזה עוזר לכם להציג טקסט בצורה חלקה ונוחה, בין אם אתם מול קהל, מקליטים וידאו או סתם מתרגלים. בהצלחה!'
                    setText(exampleText)
                    handleTextSubmit(exampleText)
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors w-1/2 min-h-[44px]"
                >
                  <span>📝</span>
                  <span className="hidden sm:inline">דוגמה</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setText('')
                    handleTextSubmit('')
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors w-1/2 min-h-[44px]"
                >
                  <span>🗑️</span>
                  <span className="hidden sm:inline">נקה</span>
                </button>
              </div>
            </div>
          </form>

          {/* Control buttons */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4">
            <button
              onClick={togglePlay}
              className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 min-h-[44px] ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
              }`}
            >
              <span>{isPlaying ? '⏸️' : '▶️'}</span>
              <span className="hidden sm:inline">{isPlaying ? 'עצור' : 'הפעל'}</span>
            </button>

            <button
              onClick={resetScroll}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 min-h-[44px] shadow-lg"
            >
              <span>🔄</span>
              <span className="hidden sm:inline">איפוס</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 min-h-[44px] shadow-lg"
            >
              <span>{isFullscreen ? '📱' : '🖥️'}</span>
              <span className="hidden sm:inline">{isFullscreen ? 'צא ממסך מלא' : 'מסך מלא'}</span>
            </button>

            <button
              onClick={toggleVideoRecorder}
              className={`px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 min-h-[44px] shadow-lg ${
                showVideoRecorder
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              <span>{showVideoRecorder ? '📹' : '🤳'}</span>
              <span className="hidden sm:inline">{showVideoRecorder ? 'סגור סלפי' : 'סלפי וידאו'}</span>
            </button>

            {/* Mobile Speed Control - only show on mobile */}
            {isMobile && (
              <div className="flex items-center gap-3 bg-gray-700 px-4 py-2 rounded-lg">
                <label className="text-sm font-medium text-gray-200 min-w-16">
                  מהירות:
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="100"
                  step="0.1"
                  value={speed}
                  onChange={(e) => adjustSpeed(parseFloat(e.target.value))}
                  className="cursor-pointer w-28 accent-green-500"
                  aria-label="שנה מהירות גלילה"
                />
                <span className="text-white font-bold min-w-10 text-center text-sm bg-gray-600 px-2 py-1 rounded">
                  {speed.toFixed(1)}x
                </span>
              </div>
            )}

            {/* Mobile Font Size Control - only show on mobile */}
            {isMobile && (
              <div className="flex items-center gap-3 bg-gray-700 px-4 py-2 rounded-lg">
                <label className="text-sm font-medium text-gray-200 min-w-16">
                  גופן:
                </label>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="0.5"
                  value={fontSize}
                  onChange={(e) => adjustFontSize(parseFloat(e.target.value))}
                  className="cursor-pointer w-28 accent-blue-500"
                  aria-label="שנה גודל גופן"
                />
                <span className="text-white font-bold min-w-10 text-center text-sm bg-gray-600 px-2 py-1 rounded">
                  {fontSize}rem
                </span>
              </div>
            )}

            {/* Screen Split Control - only show when video recorder is active */}
            {showVideoRecorder && (
              <div className="flex items-center gap-3 bg-gray-700 px-4 py-2 rounded-lg">
                <label className="text-sm font-medium text-gray-200 min-w-20">
                  רוחב מסך:
                </label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={screenSplitRatio}
                  onChange={(e) => adjustScreenSplit(parseInt(e.target.value))}
                  className="cursor-pointer w-32 accent-orange-500"
                  aria-label="שנה רוחב מסך טלפרומפטר"
                />
                <span className="text-white font-bold min-w-12 text-center text-sm bg-gray-600 px-2 py-1 rounded">
                  {screenSplitRatio}%
                </span>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
