// Try to load dotenv if available
try {
  const dotenv = require('dotenv');
  dotenv.config();
} catch (error) {
  // dotenv not available, continue without it
}

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export function decodeToken(token: string): { userId: string; role: string } {
  if (!token) {
    throw new Error('Token is required');
  }

  // Remove Bearer prefix if present
  const actualToken = token.startsWith('Bearer ')
    ? token.slice(7)
    : token;

  try {
    const payload = jwt.verify(actualToken, JWT_SECRET as string);
    if (typeof payload !== 'object' || payload === null) {
      throw new Error('Invalid token payload');
    }
    const { userId, role } = payload as { userId?: string; role?: string };
    if (!userId || !role) {
      throw new Error('Token payload missing required fields');
    }
    return { userId, role };
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Invalid token: ${err.message}`);
    }
    throw new Error('Invalid token');
  }
} 