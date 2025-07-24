const driveService = require('../services/drive.service');
const SecurityMiddleware = require('../middleware/security.middleware');

const getVideos = (req, res) => {
  const videoList = driveService.getVideoList();
  res.json({ success: true, videos: videoList });
};

// Generar token seguro para streaming
const generateStreamToken = (req, res) => {
  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({
      success: false,
      error: 'videoId es requerido'
    });
  }

  // Verificar que el video existe
  const realFileId = driveService.getRealFileId(videoId);
  if (!realFileId) {
    return res.status(404).json({
      success: false,
      error: 'Video no encontrado'
    });
  }

  // Generar token con información del cliente
  const clientInfo = {
    userAgent: req.headers['user-agent'],
    ip: req.ip
  };

  const { token, expiresAt } = SecurityMiddleware.generateSecureToken(videoId, clientInfo);

  res.json({
    success: true,
    token,
    expiresAt,
    validFor: '5 minutos'
  });
};

// Streaming seguro con validación de token
const streamVideoSecure = async (req, res) => {
  const range = req.headers.range;
  const token = req.params.token;

  if (!range) {
    return res.status(400).json({
      error: "Se requiere header Range para streaming de video",
      code: 'MISSING_RANGE_HEADER'
    });
  }

  // Validar token
  const tokenValidation = SecurityMiddleware.validateToken(token);
  if (!tokenValidation.valid) {
    return res.status(401).json({
      error: tokenValidation.error,
      code: 'INVALID_TOKEN'
    });
  }

  const { videoId } = tokenValidation.payload;

  try {
    const response = await driveService.streamVideo(videoId, range);

    // Headers de seguridad adicionales
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Headers para streaming
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', 'video/mp4');

    // Reenviar headers importantes de Google Drive
    const headersToForward = ['content-range', 'content-length', 'content-type'];
    headersToForward.forEach(header => {
      if (response.headers[header]) {
        res.setHeader(header, response.headers[header]);
      }
    });

    res.status(response.status);
    response.data.pipe(res);
  } catch (error) {
    if (error.message === 'Video no encontrado en el catálogo') {
      return res.status(404).json({
        error: error.message,
        code: 'VIDEO_NOT_FOUND'
      });
    }
    res.status(500).json({
      error: "Error conectando con Google Drive",
      code: 'DRIVE_ERROR'
    });
  }
};



const getFileInfo = async (req, res) => {
  const internalId = req.params.id;

  try {
    const fileInfo = await driveService.getFileInfo(internalId);
    res.json({ success: true, file: fileInfo });
  } catch (error) {
    if (error.message === 'Video no encontrado en el catálogo') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getVideos,
  generateStreamToken,
  streamVideoSecure,
  getFileInfo
};