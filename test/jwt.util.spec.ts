process.env.JWT_SECRET = 'test_secret';

import { decodeToken } from '../src/lib/jwt.util';
const jwt = require('jsonwebtoken');

describe('decodeToken', () => {
  const secret = 'test_secret';
  const validPayload = { userId: '123', role: 'admin' };
  const validToken = jwt.sign(validPayload, secret, { algorithm: 'HS256' });
  const bearerToken = `Bearer ${validToken}`;

  it('should decode a valid token', () => {
    const result = decodeToken(validToken);
    expect(result).toEqual(validPayload);
  });

  it('should decode a valid Bearer token', () => {
    const result = decodeToken(bearerToken);
    expect(result).toEqual(validPayload);
  });

  it('should throw error for invalid token', () => {
    expect(() => decodeToken('invalid.token.here')).toThrow('Invalid token');
  });

  it('should throw error for missing token', () => {
    expect(() => decodeToken('')).toThrow('Token is required');
  });

  it('should throw error if payload is missing fields', () => {
    const badToken = jwt.sign({ foo: 'bar' }, secret, { algorithm: 'HS256' });
    expect(() => decodeToken(badToken)).toThrow('Token payload missing required fields');
  });
}); 