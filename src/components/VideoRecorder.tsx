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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        // Request front camera for selfie with wider view to show shoulders
        const constraints = {
          video: {
            facingMode: { ideal: 'user' }, // Front camera for selfie
            width: { ideal: 1280 },
            height: { ideal: 720 } // Landscape format first, then we'll crop to vertical
          },
          audio: true
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()

          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded:', {
              videoWidth: videoRef.current?.videoWidth,
              videoHeight: videoRef.current?.videoHeight,
              duration: videoRef.current?.duration
            })
            setIsCameraReady(true)
            setError(null)
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
    if (!streamRef.current) return

    try {
      // Check for supported video formats
      let mimeType = 'video/webm;codecs=vp9'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm'
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/mp4'
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = '' // Let browser choose
            }
          }
        }
      }

      console.log('Using MIME type:', mimeType || 'browser default')

      // Record directly from camera stream
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: mimeType,
        videoBitsPerSecond: 2500000
      })

      mediaRecorderRef.current = mediaRecorder
      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
          console.log('Data chunk received:', event.data.size, 'bytes')
        }
      }

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: mimeType || 'video/webm' })
        console.log('Video blob created:', videoBlob.size, 'bytes, type:', videoBlob.type)

        // Verify the blob has content
        if (videoBlob.size === 0) {
          setError('ההקלטה לא הצליחה - אין תוכן בסרטון')
          return
        }

        onVideoReady(videoBlob)
      }

      mediaRecorder.start(100)
      onStartRecording()
      setError(null) // Clear any previous errors
      console.log('Recording started with MIME type:', mimeType)
    } catch (err) {
      console.error('Recording start error:', err)
      setError('שגיאה בהתחלת ההקלטה: ' + (err instanceof Error ? err.message : 'שגיאה לא ידועה'))
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
      {/* Camera Preview - Wider view to show shoulders */}
      <div className="relative w-full max-w-md mx-auto bg-black rounded-lg overflow-hidden aspect-[4/3]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          style={{ transform: 'scaleX(-1)' }} // Mirror effect for selfie
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


      {/* Instructions */}
      <div className="text-center text-sm text-gray-400">
        <p>🤳 מצלמה קדמית לסלפי</p>
        <p>📱 הקלטה בפורמט אנכי 9:16</p>
        <p>👔 תצוגה רחבה להצגת כתפיים</p>
        <p>📺 הטלפרומפטר ממשיך לעבוד במסך השמאלי</p>
      </div>
    </div>
  )
}

export default VideoRecorder
