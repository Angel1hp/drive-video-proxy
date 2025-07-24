const crypto = require('crypto');

const ALLOWED_IPS = ['127.0.0.1', '::1', 'localhost'];

class SecurityMiddleware {
  static validateRequest(req, res, next) {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers.referer || req.headers.origin || '';
    
    const isLocalhost = ALLOWED_IPS.some(ip => 
      clientIP.includes(ip) || clientIP === '::ffff:127.0.0.1'
    );
    
    if (!isLocalhost) {
      return this.denyAccess(res);
    }

    const validUserAgents = ['Mozilla', 'Chrome', 'Safari', 'Firefox', 'Edge'];
    const hasValidUserAgent = validUserAgents.some(ua => userAgent.includes(ua));
    
    if (!hasValidUserAgent) {
      return this.denyAccess(res);
    }

    const validReferers = ['http://localhost:5173', 'http://127.0.0.1:5173'];
    const hasValidReferer = validReferers.some(ref => 
      referer.startsWith(ref) || referer.includes('localhost:5173')
    );
    
    if (!hasValidReferer && req.path !== '/health') {
      return this.denyAccess(res);
    }

    const botPatterns = ['curl', 'wget', 'postman', 'insomnia', 'httpie', 'python-requests'];
    const isBotRequest = botPatterns.some(pattern => 
      userAgent.toLowerCase().includes(pattern)
    );
    
    if (isBotRequest) {
      return this.denyAccess(res);
    }

    if (!referer && req.path !== '/health') {
      return this.denyAccess(res);
    }

    next();
  }

  static denyAccess(res) {
    const responses = [
      { status: 404, message: 'Not Found' },
      { status: 503, message: 'Service Temporarily Unavailable' },
      { status: 502, message: 'Bad Gateway' }
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    setTimeout(() => {
      res.status(response.status).json({ error: response.message });
    }, Math.random() * 1000 + 200);
  }

  static createRateLimit() {
    const requests = new Map();
    
    return (req, res, next) => {
      const clientId = req.ip + req.headers['user-agent'];
      const now = Date.now();
      const windowMs = 60 * 1000;
      const maxRequests = 20;
      
      if (!requests.has(clientId)) {
        requests.set(clientId, []);
      }
      
      const clientRequests = requests.get(clientId);
      const validRequests = clientRequests.filter(time => now - time < windowMs);
      
      if (validRequests.length >= maxRequests) {
        return res.status(429).json({ error: 'Too Many Requests' });
      }
      
      validRequests.push(now);
      requests.set(clientId, validRequests);
      
      next();
    };
  }

  static hideServerInfo(req, res, next) {
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    res.setHeader('Server', 'nginx/1.18.0');
    next();
  }


}

module.exports = SecurityMiddleware;