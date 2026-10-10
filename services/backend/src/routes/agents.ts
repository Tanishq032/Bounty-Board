import { FastifyPluginAsync } from 'fastify';
import { db } from '../db/client';
import { agents, agentSecrets } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { encryptKey } from '../lib/operatorKeys';

const createAgentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  provider: z.string().min(1),
  model: z.string().min(1),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  pricingRule: z.string().optional(),
  maxConcurrentJobs: z.number().optional(),
  accuracyTarget: z.number().optional(),
  autoBid: z.boolean().default(false),
});

export const agentRoutes: FastifyPluginAsync = async (fastify, opts) => {
  
  fastify.post('/agents', async (request, reply) => {
    const userSession = request.session.get('user');
    if (!userSession) return reply.code(401).send({ error: 'Unauthorized' });

    try {
      const data = createAgentSchema.parse(request.body);
      const ownerAddress = userSession.address;
      
      // Generate operator key
      const privateKey = generatePrivateKey();
      const account = privateKeyToAccount(privateKey);
      const operatorAddress = account.address;
      
      const agentId = crypto.randomUUID();
      const encryptedKey = encryptKey(privateKey);

      // Insert agent
      await db.insert(agents).values({
        id: agentId,
        ownerAddress,
        name: data.name,
        description: data.description,
        provider: data.provider,
        model: data.model,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        pricingRule: data.pricingRule,
        maxConcurrentJobs: data.maxConcurrentJobs,
        accuracyTarget: data.accuracyTarget,
        autoBid: data.autoBid,
        operatorAddress,
        payoutAddress: ownerAddress, // default to owner
        createdAt: new Date(),
      });

      // Insert secret
      await db.insert(agentSecrets).values({
        agentId,
        encryptedOperatorKey: encryptedKey,
        updatedAt: new Date(),
      });

      return { success: true, agentId, operatorAddress };
    } catch (err: any) {
      return reply.code(400).send({ error: 'Validation failed', details: err.errors });
    }
  });

  fastify.get('/agents', async (request, reply) => {
    const userSession = request.session.get('user');
    if (!userSession) return reply.code(401).send({ error: 'Unauthorized' });

    const ownerAddress = userSession.address;
    const userAgents = await db.select().from(agents).where(eq(agents.ownerAddress, ownerAddress));
    return { agents: userAgents };
  });

  fastify.patch('/agents/:id', async (request, reply) => {
    const userSession = request.session.get('user');
    if (!userSession) return reply.code(401).send({ error: 'Unauthorized' });
    
    const { id } = request.params as { id: string };
    const agent = await db.select().from(agents).where(eq(agents.id, id)).get();
    
    if (!agent) return reply.code(404).send({ error: 'Agent not found' });
    if (agent.ownerAddress !== userSession.address) return reply.code(403).send({ error: 'Forbidden' });
    
    // Allow updating autoBid, isActive, pricing, etc.
    const updateData = request.body as any;
    await db.update(agents).set(updateData).where(eq(agents.id, id));
    
    return { success: true };
  });
};
