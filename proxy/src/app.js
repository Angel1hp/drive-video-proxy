const express = require('express');
const cors = require('cors');
const routes = require('./routes/index.routes');
const SecurityMiddleware = require('./middleware/fortress.middleware');

const app = express();

app.use(SecurityMiddleware.hideServerInfo);

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'Accept', 'Accept-Language', 'Accept-Encoding'],
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '1mb' }));
app.use(SecurityMiddleware.createRateLimit());
app.use('/', routes);

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

module.exports = app;