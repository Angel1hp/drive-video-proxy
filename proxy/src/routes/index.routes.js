const express = require('express');
const { getVideos, generateToken, streamVideo } = require('../controllers/video.controller');

const router = express.Router();

const routeProtection = (req, res, next) => {
  const referer = req.headers.referer || req.headers.origin || '';
  const userAgent = req.headers['user-agent'] || '';
  
  const isLegitimate = referer.includes('localhost:5173') || 
                      referer.includes('127.0.0.1:5173') ||
                      req.headers.origin === 'http://localhost:5173';
  
  if (isLegitimate) {
    return next();
  }
  
  const botPatterns = ['curl', 'wget', 'postman', 'insomnia', 'python-requests'];
  const isBot = botPatterns.some(pattern => userAgent.toLowerCase().includes(pattern));
  
  if (isBot) {
    return res.status(503).json({ error: 'Service Unavailable' });
  }
  
  return res.status(404).json({ error: 'Not Found' });
};

router.get('/api/videos', routeProtection, getVideos);
router.post('/api/generate-token', routeProtection, generateToken);
router.get('/api/video/:token', routeProtection, streamVideo);

router.get('/health', (req, res) => {
  res.status(200).send('OK');
});

router.get('/', (req, res) => {
  const referer = req.headers.referer || '';
  
  if (!referer.includes('localhost:5173')) {
    return res.status(503).json({ error: 'Service Unavailable' });
  }
  
  res.json({ status: 'OK' });
});

module.exports = router;