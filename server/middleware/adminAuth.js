import crypto from 'crypto';

const secret = () => process.env.ADMIN_TOKEN_SECRET || process.env.MONGODB_URI || 'change-this-admin-secret';

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const sign = (value) => crypto.createHmac('sha256', secret()).update(value).digest('base64url');

export const createAdminToken = () => {
  const payload = encode({ role: 'admin', exp: Date.now() + 1000 * 60 * 60 * 24 });
  return `${payload}.${sign(payload)}`;
};

const isValidToken = (token) => {
  if (!token) return false;
  const [payload, signature] = token.split('.');
  const expectedSignature = payload ? sign(payload) : '';
  if (!payload || !signature || signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return decoded.role === 'admin' && decoded.exp > Date.now();
  } catch {
    return false;
  }
};

export const requireAdmin = (request, response, next) => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!isValidToken(token)) return response.status(401).json({ message: 'Admin login required.' });
  next();
};

export const adminLogin = (request, response) => {
  const { username, password } = request.body;
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    return response.status(503).json({ message: 'Admin credentials are not configured.' });
  }
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return response.status(401).json({ message: 'Invalid admin credentials.' });
  }
  return response.json({ token: createAdminToken() });
};
