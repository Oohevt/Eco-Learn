import jwt from 'jsonwebtoken';

const JWT_SECRET = 'econolearn-jwt-secret-key-2024-local-dev';
const TOKEN_EXPIRY = '7d';

function createToken(userId) {
  return jwt.sign(
    { sub: userId },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export { createToken, verifyToken };
