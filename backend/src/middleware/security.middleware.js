const crypto = require('crypto');
const SECRET_KEY = 'secure-token-key';
const TOKEN_EXPIRY = 5 * 60 * 1000; // 5 minutos

class SecurityMiddleware {
  // Genera un token seguro con expiración
  static generateSecureToken(videoId, clientInfo = {}) {
    const timestamp = Date.now();
    const expiresAt = timestamp + TOKEN_EXPIRY;
    
    const payload = {
      videoId,
      timestamp,
      expiresAt,
      clientInfo: {
        userAgent: clientInfo.userAgent?.substring(0, 50) || '',
        ip: clientInfo.ip || 'unknown'
      }
    };
    
    const dataToSign = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(dataToSign)
      .digest('hex');
    
    const token = Buffer.from(JSON.stringify({
      ...payload,
      signature
    })).toString('base64');
    
    return { token, expiresAt };
  }
  
  // Valida un token generado por generateSecureToken
  static validateToken(token) {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      const { signature, ...payload } = decoded;
      
      // Verificar expiración
      if (Date.now() > payload.expiresAt) {
        return { valid: false, error: 'Token expired' };
      }
      
      // Verificar firma
      const dataToSign = JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(dataToSign)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid token' };
      }
      
      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: 'Malformed token' };
    }
  }
  
  // Middleware para validar el origen de la petición
  static validateOrigin(req, res, next) {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
    const origin = req.headers.origin || req.headers.referer;
    
    if (!origin || !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return res.status(403).json({ 
        error: 'Access denied', 
        code: 'INVALID_ORIGIN' 
      });
    }
    
    next();
  }
  
  // Middleware para validar headers básicos

  static validateHeaders(req, res, next) {
    const requiredHeaders = ['user-agent', 'accept'];
    
    for (const header of requiredHeaders) {
      if (!req.headers[header]) {
        return res.status(400).json({ 
          error: `Missing required header: ${header}` 
        });
      }
    }
    
    next();
  }
}

module.exports = SecurityMiddleware;