import { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client';
import { users, posterProfiles, bidderProfiles } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const posterProfileSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  organization: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

const bidderProfileSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  skills: z.array(z.string()).optional(),
  validatedLinks: z.array(z.string().url()).optional(),
});

export const meRoutes: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get('/me', async (request, reply) => {
    const userSession = request.session.get('user');
    if (!userSession) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const walletAddress = userSession.address;
    const user = await db.select().from(users).where(eq(users.walletAddress, walletAddress)).get();
    
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const poster = await db.select().from(posterProfiles).where(eq(posterProfiles.walletAddress, walletAddress)).get();
    const bidder = await db.select().from(bidderProfiles).where(eq(bidderProfiles.walletAddress, walletAddress)).get();

    return {
      user: {
        address: user.walletAddress,
        createdAt: user.createdAt,
      },
      roles: {
        poster: !!poster,
        bidder: !!bidder,
      },
      profile: {
        poster,
        bidder,
      }
    };
  });

  fastify.post('/me/roles', async (request, reply) => {
    const userSession = request.session.get('user');
    if (!userSession) return reply.code(401).send({ error: 'Unauthorized' });

    const walletAddress = userSession.address;
    const { role, enabled } = request.body as { role: 'poster' | 'bidder', enabled: boolean };

    if (role === 'poster') {
      const existing = await db.select().from(posterProfiles).where(eq(posterProfiles.walletAddress, walletAddress)).get();
      if (enabled && !existing) {
        await db.insert(posterProfiles).values({
          walletAddress,
          displayName: 'New Poster',
          createdAt: new Date(),
        });
      } else if (!enabled && existing) {
        await db.delete(posterProfiles).where(eq(posterProfiles.walletAddress, walletAddress));
      }
    } else if (role === 'bidder') {
      const existing = await db.select().from(bidderProfiles).where(eq(bidderProfiles.walletAddress, walletAddress)).get();
      if (enabled && !existing) {
        await db.insert(bidderProfiles).values({
          walletAddress,
          displayName: 'New Bidder',
          createdAt: new Date(),
        });
      } else if (!enabled && existing) {
        await db.delete(bidderProfiles).where(eq(bidderProfiles.walletAddress, walletAddress));
      }
    }

    return { success: true };
  });

  fastify.post('/me/profile/poster', async (request, reply) => {
    const userSession = request.session.get('user');
    if (!userSession) return reply.code(401).send({ error: 'Unauthorized' });
    
    try {
      const data = posterProfileSchema.parse(request.body);
      const walletAddress = userSession.address;
      
      const existing = await db.select().from(posterProfiles).where(eq(posterProfiles.walletAddress, walletAddress)).get();
      if (!existing) return reply.code(404).send({ error: 'Poster role not enabled' });
      
      await db.update(posterProfiles)
        .set(data)
        .where(eq(posterProfiles.walletAddress, walletAddress));
        
      return { success: true };
    } catch (err: any) {
      return reply.code(400).send({ error: 'Validation failed', details: err.errors });
    }
  });

  fastify.post('/me/profile/bidder', async (request, reply) => {
    const userSession = request.session.get('user');
    if (!userSession) return reply.code(401).send({ error: 'Unauthorized' });
    
    try {
      const data = bidderProfileSchema.parse(request.body);
      const walletAddress = userSession.address;
      
      const existing = await db.select().from(bidderProfiles).where(eq(bidderProfiles.walletAddress, walletAddress)).get();
      if (!existing) return reply.code(404).send({ error: 'Bidder role not enabled' });
      
      await db.update(bidderProfiles)
        .set(data)
        .where(eq(bidderProfiles.walletAddress, walletAddress));
        
      return { success: true };
    } catch (err: any) {
      return reply.code(400).send({ error: 'Validation failed', details: err.errors });
    }
  });
};
