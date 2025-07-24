import { useState, useEffect } from 'react';

interface VideoPlayerProps {
  videoId: string;
}

const API_BASE = import.meta.env.VITE_API_BASE;

const VideoPlayer = ({ videoId }: VideoPlayerProps) => {
  const [secureToken, setSecureToken] = useState<string | null>(null);

  useEffect(() => {
    if (videoId) {
      generateSecureToken();
    }
  }, [videoId]);

  const generateSecureToken = async () => {
    try {
      const response = await fetch(`${API_BASE}/generate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      });
      const data = await response.json();
      if (data.token) {
        setSecureToken(data.token);
      } else {
        console.error('No se recibió token');
      }
    } catch (error) {
      console.error('Token generation failed:', error);
    }
  };

  const videoUrl = secureToken
    ? `${API_BASE}/secure-stream/${secureToken}`
    : '';

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
  );
};

export default VideoPlayer;
