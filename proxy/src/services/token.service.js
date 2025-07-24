const crypto = require('crypto');
const { TOKEN_EXPIRY } = require('../config/cors.config');

//TOKEN PARA ENCRIPTAR EL ID DE LA URL DEL DRIVE
class TokenService {
  constructor() {
    this.tokenMap = new Map();
    this.startCleanupInterval();
  }

  generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  createToken(videoId) {
    // Verificar si el token ya existe
    for (const [existingToken, data] of this.tokenMap.entries()) {
      if (data.videoId === videoId && Date.now() < data.expiresAt) {
        return { token: existingToken, expiresAt: data.expiresAt };
      }
    }

    // Generar nuevo token
    const token = this.generateSecureToken();
    const expiresAt = Date.now() + TOKEN_EXPIRY;

    this.tokenMap.set(token, {
      videoId,
      createdAt: Date.now(),
      expiresAt
    });

    return { token, expiresAt };
  }

  getVideoId(token) {
    if (this.tokenMap.has(token)) {
      const tokenData = this.tokenMap.get(token);
      return tokenData.videoId;
    }
    return token; // Respaldo directo con ID de video
  }

  startCleanupInterval() {
    // Limpiar tokens expirados cada hora
    setInterval(() => {
      const now = Date.now();
      for (const [token, data] of this.tokenMap.entries()) {
        if (now > data.expiresAt) this.tokenMap.delete(token);
      }
    }, 60 * 60 * 1000);
  }
}

module.exports = new TokenService();