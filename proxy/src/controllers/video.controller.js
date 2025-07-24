const axios = require('axios');
const { DRIVE_BACKEND_URL } = require('../config/cors.config');
const tokenService = require('../services/token.service');

const getVideos = async (req, res) => {
  try {
    const response = await axios.get(`${DRIVE_BACKEND_URL}/videos`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Backend unavailable' });
  }
};
  
const generateToken = async (req, res) => {
  try {
    const { videoId } = req.body;

    const response = await axios.post(`${DRIVE_BACKEND_URL}/generate-token`,
      { videoId },
      {
        headers: {
          'Origin': 'http://localhost:3000',
          'User-Agent': req.headers['user-agent'] || 'ProxyServer/1.0',
          'Accept': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: 'Token generation failed'
    });
  }
};

const streamVideo = async (req, res) => {
  try {
    const range = req.headers.range;
    const token = req.params.token;

    const response = await axios.get(`${DRIVE_BACKEND_URL}/secure-stream/${token}`, {
      headers: {
        Range: range,
        'Origin': 'http://localhost:3000',
        'User-Agent': req.headers['user-agent'] || 'ProxyServer/1.0',
        'Accept': 'video/*'
      },
      responseType: 'stream'
    });

    const safeHeaders = ['content-range', 'accept-ranges', 'content-length', 'content-type'];
    res.status(response.status);
    safeHeaders.forEach(header => {
      if (response.headers[header]) {
        res.setHeader(header, response.headers[header]);
      }
    });

    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-cache');

    response.data.pipe(res);
  } catch (error) {
    if (error.response?.status === 401) {
      res.status(401).json({ error: 'Token expired' });
    } else if (error.response?.status === 403) {
      res.status(403).json({ error: 'Access denied' });
    } else {
      res.status(500).send('Streaming error');
    }
  }
};

module.exports = {
  getVideos,
  generateToken,
  streamVideo
};