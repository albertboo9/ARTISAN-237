export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for Node.js environments
  const { randomBytes } = require('crypto');
  return randomBytes(16).toString('hex');
}