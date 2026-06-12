const crypto = require('crypto');

const env = require('../../config/env');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getEncryptionKey() {
  return crypto.createHash('sha256').update(env.paymentSecretEncryptionKey).digest();
}

function encryptSecret(value) {
  if (!value) {
    return null;
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join('.');
}

function decryptSecret(value) {
  if (!value) {
    return null;
  }

  const [ivHex, authTagHex, encryptedHex] = String(value).split('.');
  if (!ivHex || !authTagHex || !encryptedHex) {
    return null;
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}

function maskSecret(value) {
  if (!value) {
    return null;
  }

  const stringValue = String(value);
  if (stringValue.length <= 8) {
    return `${stringValue.slice(0, 2)}********`;
  }

  return `${stringValue.slice(0, Math.min(7, stringValue.length - 4))}********${stringValue.slice(-4)}`;
}

module.exports = {
  encryptSecret,
  decryptSecret,
  maskSecret
};
