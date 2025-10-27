import React, { useRef, useEffect } from 'react'

interface VideoPreviewProps {
  videoBlob: Blob
  onSave: () => void
  onCancel: () => void
  onRecordAgain: () => void
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoBlob,
  onSave,
  onCancel,
  onRecordAgain
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const downloadLinkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (videoRef.current && videoBlob) {
      const videoUrl = URL.createObjectURL(videoBlob)
      videoRef.current.src = videoUrl

      // Clean up URL when component unmounts
      return () => {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [videoBlob])

  const handleDownload = () => {
    if (downloadLinkRef.current) {
      downloadLinkRef.current.click()
    }
  }

  const handleSave = () => {
    handleDownload()
    onSave()
  }

  return (
    <div className="flex flex-col items-center gap-4 max-w-xl mx-auto relative z-50 mb-20">
      {/* Video Preview */}
      <div className="relative w-full max-w-xs mx-auto bg-black rounded-lg overflow-hidden aspect-[9/16]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          controls
          playsInline
        />

        {/* Video info */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
          📹 סרטון מוכן
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center bg-gray-900 bg-opacity-95 backdrop-blur-lg p-4 rounded-xl border-2 border-gray-500 shadow-2xl">
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 text-base shadow-lg"
        >
          <span>💾</span>
          <span>שמור סרטון</span>
        </button>

        <button
          onClick={onRecordAgain}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 text-base shadow-lg"
        >
          <span>🔄</span>
          <span>הקלטה חדשה</span>
        </button>

        <button
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 text-base shadow-lg"
        >
          <span>❌</span>
          <span>ביטול</span>
        </button>
      </div>

      {/* Hidden download link */}
      <a
        ref={downloadLinkRef}
        href={URL.createObjectURL(videoBlob)}
        download={`teleprompter-video-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`}
        style={{ display: 'none' }}
      />

      {/* Instructions */}
      <div className="text-center text-sm text-gray-400">
        <p>✅ הסרטון מוכן להורדה</p>
        <p>💡 לחץ על "שמור סרטון" להורדת הקובץ</p>
        <p>🔄 לחץ על "הקלטה חדשה" להתחלה מחדש</p>
      </div>
    </div>
  )
}

export default VideoPreview
