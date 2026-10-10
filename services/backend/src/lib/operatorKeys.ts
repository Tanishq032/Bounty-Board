import crypto from 'crypto';

// Use a static secret for testnet/development if not provided
const SERVER_SECRET = process.env.ENCRYPTION_SECRET || '0123456789abcdef0123456789abcdef';

export function encryptKey(privateKey: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(SERVER_SECRET), iv);
  
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return JSON.stringify({
    iv: iv.toString('hex'),
    encrypted,
    authTag,
  });
}

export function decryptKey(encryptedData: string): string {
  const { iv, encrypted, authTag } = JSON.parse(encryptedData);
  
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm', 
    Buffer.from(SERVER_SECRET), 
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
