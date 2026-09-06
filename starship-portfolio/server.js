import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { autonomaHandler } from './autonoma.js';
import dataHandler from './api/data.js';
import loginHandler from './api/login.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.all('/api/login', loginHandler);
app.all('/api/data', dataHandler);
app.post('/api/autonoma', autonomaHandler);

// Add security headers
app.use((req, res, next) => {
  // Remove or adjust COOP header for MSAL popup authentication
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle React routing - return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
