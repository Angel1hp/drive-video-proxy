const VIDEO_CATALOG = {
  'video1': '1eHv5dhXZkOJhnLUzr4RZUY7Bo9pOkkWp'
};

global.VIDEO_CATALOG = VIDEO_CATALOG;

const { PORT, CORS_OPTIONS } = require('./src/config/cors.config');
const express = require('express');
const cors = require('cors');
const routes = require('./src/routes/index.routes');
const app = express();

app.use(cors(CORS_OPTIONS));
app.use(express.json());
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

module.exports = app;