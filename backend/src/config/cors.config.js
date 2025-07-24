const PORT = process.env.PORT || 4000;

const CORS_OPTIONS = {
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Proxy server
    'http://localhost:4000', // Backend server
  ],
  credentials: true,
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Type']
};

module.exports = {
  PORT,
  CORS_OPTIONS
};
