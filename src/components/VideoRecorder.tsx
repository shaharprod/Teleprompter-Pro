import React, { useState, useRef, useEffect } from 'react'

interface VideoRecorderProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  onVideoReady: (videoBlob: Blob) => void
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  onVideoReady
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasStreamRef = useRef<MediaStream | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(0.7) // 0.7 = zoom out to show shoulders

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        // Request front camera - we'll crop it to vertical format
        const constraints = {
          video: {
            facingMode: { ideal: 'user' }, // Front camera for selfie
            width: { ideal: 1280 },
            height: { ideal: 720 } // Get landscape format first
          },
          audio: true
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          setIsCameraReady(true)
          setError(null)

          // Setup canvas for vertical recording
          if (canvasRef.current) {
            const canvas = canvasRef.current
            canvas.width = 720  // Vertical width
            canvas.height = 1280 // Vertical height
          }
        }
      } catch (err) {
        console.error('Camera access error:', err)
        setError('לא ניתן לגשת למצלמה. אנא בדוק הרשאות מצלמה.')
        setIsCameraReady(false)
      }
    }

    initCamera()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startRecording = async () => {
    if (!streamRef.current || !videoRef.current || !canvasRef.current) return

    try {
      const canvas = canvasRef.current
      const video = videoRef.current
      
      // Wait for video to be ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError('המצלמה עדיין לא מוכנה. אנא המתן רגע.')
        return
      }
      
      // Create canvas stream for vertical recording
      const canvasStream = canvas.captureStream(30) // 30 FPS
      canvasStreamRef.current = canvasStream
      
      // Combine canvas video with original audio
      const audioTracks = streamRef.current.getAudioTracks()
      audioTracks.forEach(track => {
        canvasStream.addTrack(track)
      })
      
      // Start drawing to canvas
      const drawToCanvas = () => {
        if (canvas && video) {
          const ctx = canvas.getContext('2d')
          if (ctx) {
            // Clear canvas
            ctx.fillStyle = '#000000'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            // Draw video centered and cropped to vertical format with zoom
            const videoWidth = video.videoWidth
            const videoHeight = video.videoHeight
            
            // Calculate crop area with zoom level (smaller crop = more zoom out)
            const cropSize = Math.min(videoWidth, videoHeight * (9/16)) * zoomLevel
            const cropX = (videoWidth - cropSize) / 2
            const cropY = (videoHeight - cropSize * (16/9)) / 2
            
            ctx.drawImage(
              video,
              cropX, cropY, cropSize, cropSize * (16/9), // Source crop
              0, 0, canvas.width, canvas.height // Destination
            )
          }
          if (isRecording) {
            requestAnimationFrame(drawToCanvas)
          }
        }
      }
      
      // Start drawing
      drawToCanvas()
      
      // Record canvas stream
      const mediaRecorder = new MediaRecorder(canvasStream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000
      })
      
      mediaRecorderRef.current = mediaRecorder
      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' })
        onVideoReady(videoBlob)
      }

      mediaRecorder.start(100)
      onStartRecording()
      setError(null) // Clear any previous errors
    } catch (err) {
      console.error('Recording start error:', err)
      setError('שגיאה בהתחלת ההקלטה')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      onStopRecording()
    }
  }

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 h-full w-full">
      {/* Camera Preview - Vertical format for social media */}
      <div className="relative w-full max-w-xs mx-auto bg-black rounded-lg overflow-hidden aspect-[9/16]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          style={{ transform: 'scaleX(-1)' }} // Mirror effect for selfie
        />

        {/* Hidden canvas for recording */}
        <canvas
          ref={canvasRef}
          className="hidden"
          width={720}
          height={1280}
        />

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-bold">REC</span>
          </div>
        )}

        {/* Camera status */}
        {!isCameraReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>מאתחל מצלמה...</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900 text-white p-4">
            <div className="text-center">
              <p className="text-red-200 mb-2">⚠️ {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                רענן דף
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Button */}
      <button
        onClick={handleRecordClick}
        disabled={!isCameraReady || !!error}
        className={`px-6 py-3 rounded-full font-bold text-white transition-all duration-200 flex items-center gap-2 ${
          isRecording
            ? 'bg-red-600 hover:bg-red-700 animate-pulse'
            : 'bg-green-600 hover:bg-green-700'
        } ${!isCameraReady || error ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isRecording ? (
          <>
            <span>⏹️</span>
            <span>עצור הקלטה</span>
          </>
        ) : (
          <>
            <span>🎥</span>
            <span>התחל הקלטה</span>
          </>
        )}
      </button>

      {/* Zoom Control */}
      <div className="flex items-center gap-3 bg-gray-700 px-4 py-2 rounded-lg">
        <label className="text-sm font-medium text-gray-200 min-w-16">
          זום:
        </label>
        <input
          type="range"
          min="0.5"
          max="1.2"
          step="0.1"
          value={zoomLevel}
          onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
          className="cursor-pointer w-24 accent-blue-500"
          aria-label="שנה רמת זום"
        />
        <span className="text-white font-bold min-w-10 text-center text-sm bg-gray-600 px-2 py-1 rounded">
          {zoomLevel.toFixed(1)}x
        </span>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-400">
        <p>🤳 מצלמה קדמית לסלפי</p>
        <p>📱 הקלטה בפורמט אנכי 9:16</p>
        <p>🔍 זום אאוט להצגת כתפיים</p>
        <p>📺 הטלפרומפטר ממשיך לעבוד במסך השמאלי</p>
      </div>
    </div>
  )
}

export default VideoRecorder
