const express = require('express');
const { getVideos, generateStreamToken, streamVideoSecure } = require('../controllers/video.controller');
const SecurityMiddleware = require('../middleware/security.middleware');
const { PORT } = require('../config/cors.config');

const router = express.Router();


router.get('/videos', getVideos);

router.post('/generate-token',
  SecurityMiddleware.validateOrigin,
  SecurityMiddleware.validateHeaders,
  generateStreamToken
);

router.get('/secure-stream/:token',
  SecurityMiddleware.validateOrigin,
  SecurityMiddleware.validateHeaders,
  streamVideoSecure
);

router.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Video Backend', port: PORT });
});

router.get('/', (req, res) => {
  res.json({
    service: 'Secure Video Backend',
    status: 'OK',
    endpoints: {
      videos: '/videos',
      generateToken: '/generate-token',
      secureStream: '/secure-stream/:token',
      health: '/health'
    }
  });
});

module.exports = router;