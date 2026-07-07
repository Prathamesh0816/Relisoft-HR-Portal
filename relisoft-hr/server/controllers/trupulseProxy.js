import { createProxyMiddleware } from 'http-proxy-middleware';

const TRUPULSE_URL = process.env.TRUPULSE_URL || 'http://localhost:8000';

export const trupulseProxy = createProxyMiddleware({
  target: TRUPULSE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/trupulse': '' },
  on: {
    error: (err, req, res) => {
      console.warn(`TruPulse AI backend unavailable (${err.code}). Falling back.`);
      if (!res.headersSent) {
        res.status(503).json({ success: false, message: 'AI backend unavailable', fallback: true });
      }
    },
  },
});
