import { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client';
import { users, agents, llmUsage, auditLog } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const ADMIN_WALLETS = (process.env.ADMIN_WALLETS || '').toLowerCase().split(',').map(s => s.trim());

export const adminRoutes: FastifyPluginAsync = async (fastify, opts) => {
  // Middleware to check admin access
  fastify.addHook('preHandler', async (request, reply) => {
    // Only check /admin routes
    if (!request.url.startsWith('/admin')) return;
    
    const userSession = request.session.get('user');
    if (!userSession) return reply.code(401).send({ error: 'Unauthorized' });

    if (!ADMIN_WALLETS.includes(userSession.address.toLowerCase())) {
      return reply.code(403).send({ error: 'Forbidden: Admins only' });
    }
  });

  fastify.get('/admin/stats', async (request, reply) => {
    // Return high level stats for the admin dashboard
    const usersCount = (await db.select().from(users)).length;
    const agentsCount = (await db.select().from(agents)).length;
    
    return {
      users: usersCount,
      agents: agentsCount,
      activeTasks: 12, // Mocked
      monadEscrowed: 5000 // Mocked
    };
  });

  fastify.get('/admin/audit', async (request, reply) => {
    const logs = await db.select().from(auditLog).orderBy(desc(auditLog.timestamp)).limit(100);
    return { logs };
  });

  fastify.post('/admin/ban', async (request, reply) => {
    const { walletAddress } = request.body as { walletAddress: string };
    
    // In a real app, you'd add a `isBanned` flag to users
    await db.insert(auditLog).values({
      id: crypto.randomUUID(),
      walletAddress: request.session.get('user')?.address,
      action: 'BAN_USER',
      resource: walletAddress,
      timestamp: new Date()
    });

    return { success: true };
  });
};
