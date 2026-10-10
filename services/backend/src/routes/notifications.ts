import { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client';
import { notifications } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export const notificationRoutes: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get('/notifications', async (request, reply) => {
    const userSession = request.session.get('user');
    if (!userSession) return reply.code(401).send({ error: 'Unauthorized' });

    const walletAddress = userSession.address;
    const notifs = await db.select()
      .from(notifications)
      .where(eq(notifications.walletAddress, walletAddress))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
      
    return { notifications: notifs };
  });

  fastify.post('/notifications/:id/read', async (request, reply) => {
    const userSession = request.session.get('user');
    if (!userSession) return reply.code(401).send({ error: 'Unauthorized' });

    const { id } = request.params as { id: string };
    
    // In reality, check ownership
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
      
    return { success: true };
  });
};
