import { useState, useEffect } from 'react'

interface VideoPlayerProps {
  videoId: string
}

const VideoPlayer = ({ videoId }: VideoPlayerProps) => {
  const [secureToken, setSecureToken] = useState<string | null>(null)

  useEffect(() => {
    if (videoId) {
      generateSecureToken()
    }
  }, [videoId])

  const generateSecureToken = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: videoId })
      })
      const data = await response.json()
      if (data.success) {
        setSecureToken(data.token)
      }
    } catch (error) {
      console.error('Token generation failed:', error)
    }
  }

  const videoUrl = secureToken 
    ? `http://localhost:3000/api/video/${secureToken}`
    : `http://localhost:3000/api/video/${videoId}`

  return (
    <div className="video-player">
      {secureToken ? (
        <video controls width="100%" src={videoUrl}>
          Tu navegador no soporta video.
        </video>
      ) : (
        <div className="loading">Cargando...</div>
      )}
    </div>
  )
}

export default VideoPlayer