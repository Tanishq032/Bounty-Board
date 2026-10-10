import { FastifyPluginAsync } from 'fastify';
import { verifyMessage } from 'viem';
import { db } from '../db/client';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export const authRoutes: FastifyPluginAsync = async (fastify, opts) => {
  
  fastify.post('/auth/nonce', async (request, reply) => {
    const nonce = crypto.randomBytes(16).toString('hex');
    request.session.set('nonce', nonce);
    return { nonce };
  });

  fastify.post('/auth/verify', async (request, reply) => {
    const { message, signature, address } = request.body as { message: string, signature: string, address: string };
    
    try {
      let valid = false;

      // Allow mock signature for local development mock account
      if (
        address.toLowerCase() === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266' &&
        signature === '0xmocksignature'
      ) {
        valid = true;
      } else {
        valid = await verifyMessage({
          address: address as `0x${string}`,
          message,
          signature: signature as `0x${string}`
        });
      }

      if (!valid) {
        return reply.code(401).send({ error: 'Invalid signature' });
      }

      // Upsert user
      const existing = await db.select().from(users).where(eq(users.walletAddress, address.toLowerCase())).get();
      if (!existing) {
        await db.insert(users).values({
          walletAddress: address.toLowerCase(),
          nonce: crypto.randomBytes(16).toString('hex'),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Create session in db
      const sessionId = crypto.randomUUID();
      await db.insert(sessions).values({
        id: sessionId,
        walletAddress: address.toLowerCase(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      });

      // Save to secure session cookie
      request.session.set('user', { address: address.toLowerCase() });
      request.session.set('sessionId', sessionId);

      return { success: true, address: address.toLowerCase() };
    } catch (e) {
      console.error('Verify error:', e);
      return reply.code(400).send({ error: 'Signature verification failed' });
    }
  });

  fastify.post('/auth/logout', async (request, reply) => {
    const sessionId = request.session.get('sessionId');
    if (sessionId) {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    }
    request.session.delete();
    return { success: true };
  });
};
