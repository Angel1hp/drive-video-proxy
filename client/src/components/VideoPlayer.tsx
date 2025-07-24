import 'plyr/dist/plyr.css';
import { useState, useEffect, useRef } from 'react';

interface VideoPlayerProps {
  videoId: string;
}

const API_BASE = import.meta.env.VITE_API_BASE;

const VideoPlayer = ({ videoId }: VideoPlayerProps) => {
  const [secureToken, setSecureToken] = useState<string | null>(null);
  const playerRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoId) generateSecureToken();
  }, [videoId]);

  useEffect(() => {
    if (secureToken && playerRef.current) {
      // Import Plyr dinámicamente solo en cliente (evita errores en SSR)
      import('plyr').then((PlyrModule) => {
        const Plyr = PlyrModule.default;
        new Plyr(playerRef.current!, {
          controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
          autoplay: false,
        });
      });
    }
  }, [secureToken]);

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
      console.error('Error generando token:', error);
    }
  };

  const videoUrl = secureToken
    ? `${API_BASE}/secure-stream/${secureToken}`
    : '';

  return (
    <div className="video-player">
      {secureToken ? (
        <video
          ref={playerRef}
          className="plyr__video-embed"
          controls
          width="100%"
        >
          <source src={videoUrl} type="video/mp4" />
          Tu navegador no soporta video.
        </video>
      ) : (
        <div className="loading">Cargando...</div>
      )}
    </div>
  );
};

export default VideoPlayer;
