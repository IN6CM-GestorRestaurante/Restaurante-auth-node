import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { RefreshToken } from '../src/auth/refreshToken.model.js';

export function generateRefreshToken() {
  return crypto.randomBytes(32).toString('hex'); // 64 chars hex
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function saveRefreshToken(userId, familyId = uuidv4()) {
  const raw = generateRefreshToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días

  await RefreshToken.create({
    TokenHash: hashToken(raw),
    UserId: userId,
    FamilyId: familyId,
    ExpiresAt: expiresAt,
  });

  return { raw, familyId };
}

export async function revokeAllUserTokens(userId) {
  await RefreshToken.update(
    { RevokedAt: new Date() },
    { where: { UserId: userId, RevokedAt: null } }
  );
}
