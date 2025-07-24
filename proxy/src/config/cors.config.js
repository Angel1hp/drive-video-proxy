module.exports = {
  PORT: 3000,
  DRIVE_BACKEND_URL: 'http://localhost:4000',
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 horas
  CORS_OPTIONS: {
    origin: [
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // Proxy server
      'http://localhost:4000', // Backend server
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
    exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length']
  }
};