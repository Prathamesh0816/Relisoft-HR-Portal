import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.resolve(__dirname, '../../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const auditLogPath = path.join(logDir, 'ai-audit.jsonl');

function appendAuditLog(entry) {
  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(auditLogPath, line, 'utf-8');
}

export const aiAuditLogger = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    if (req.path.startsWith('/api/ai') && req.method !== 'GET') {
      const auditEntry = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        userId: req.user?._id || req.user?.id || 'anonymous',
        requestBody: sanitizeForAudit(req.body),
        responseCode: res.statusCode,
        responsePreview: sanitizeForAudit(body),
        duration: Date.now() - (req._startTime || Date.now()),
        ip: req.ip,
      };
      appendAuditLog(auditEntry);
    }
    return originalJson(body);
  };

  if (!req._startTime) {
    req._startTime = Date.now();
  }

  next();
};

function sanitizeForAudit(data) {
  if (!data) return null;
  if (typeof data === 'string') {
    if (data.length > 1000) return data.substring(0, 1000) + '... [truncated]';
    return data;
  }
  if (typeof data === 'object') {
    const sanitized = { ...data };
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    for (const key of sensitiveKeys) {
      if (sanitized[key]) sanitized[key] = '***';
    }
    const str = JSON.stringify(sanitized);
    if (str.length > 2000) {
      return JSON.parse(str.substring(0, 2000) + '"}');
    }
    return sanitized;
  }
  return data;
}

export default aiAuditLogger;
