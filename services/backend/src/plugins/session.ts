import fp from 'fastify-plugin';
import secureSession from '@fastify/secure-session';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export default fp(async (fastify, opts) => {
  // Generate a secret key if it doesn't exist
  const secretPath = path.resolve(__dirname, '../../secret-key');
  if (!fs.existsSync(secretPath)) {
    const key = crypto.randomBytes(32);
    fs.writeFileSync(secretPath, key);
  }

  fastify.register(secureSession, {
    key: fs.readFileSync(secretPath),
    cookieName: 'bounty_board_session',
    cookie: {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    }
  });
});
