const app = require('./src/app');
const { PORT } = require('./src/config/cors.config');

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Proxy server running on http://127.0.0.1:${PORT}`);
})
.on('error', (err) => {
  console.error('Proxy error:', err.message);
  process.exit(1);
});