import Fastify from 'fastify';
import cors from '@fastify/cors';
import sessionPlugin from './plugins/session';
import { authRoutes } from './routes/auth';
import { meRoutes } from './routes/me';
import { agentRoutes } from './routes/agents';
import { notificationRoutes } from './routes/notifications';
import { adminRoutes } from './routes/admin';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

const fastify = Fastify({ logger: true });

// Security hardening
fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    }
  }
});

fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// Register CORS
fastify.register(cors, {
  origin: true, // In production, restrict this to frontend URL
  credentials: true,
});

// Register session plugin
fastify.register(sessionPlugin);

// Register routes
fastify.register(authRoutes);
fastify.register(meRoutes);
fastify.register(agentRoutes);
fastify.register(notificationRoutes);
fastify.register(adminRoutes);

// In-memory store for Hackathon/MVP purposes. 
const taskPayloads = new Map<string, any>();
const goldSets = new Map<string, any>(); 

fastify.post('/tasks/payload', async (request, reply) => {
  const { payload } = request.body as any;
  const id = Date.now().toString(); 
  taskPayloads.set(id, payload);
  return { success: true, inputHash: id };
});

fastify.get('/tasks/payload/:id', async (request, reply) => {
  const { id } = request.params as any;
  if (!taskPayloads.has(id)) return reply.status(404).send({ error: 'Payload not found' });
  return { success: true, payload: taskPayloads.get(id) };
});

fastify.post('/tasks/gold-set', async (request, reply) => {
  const { goldSet } = request.body as any;
  const id = Date.now().toString(); 
  goldSets.set(id, goldSet);
  return { success: true, goldCommitment: id };
});

fastify.get('/internal/gold-set/:id', async (request, reply) => {
  const { id } = request.params as any;
  if (!goldSets.has(id)) return reply.status(404).send({ error: 'Gold set not found' });
  return { success: true, goldSet: goldSets.get(id) };
});

// MOCK PONDER GRAPHQL INDEXER FOR MVP
fastify.post('/graphql', async (request, reply) => {
  // Return mocked tasks for the Poster workspace
  return {
    data: {
      tasks: {
        items: [
          {
            id: '1',
            poster: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            title: 'Scrape 10,000 AI startup leads',
            description: 'Need a verified list of AI startups with CEO contacts, raised capital, and domain names.',
            reward: '50000000000000000000', // 50 MONAD
            deadline: (Date.now() + 86400000 * 3).toString(),
            status: 0, // Open
            bids: {
              items: [] // No bids yet
            }
          },
          {
            id: '2',
            poster: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            title: 'Train LLaMA-3 LoRA on customer support transcripts',
            description: 'Provide the LoRA weights that achieve <1.0 eval loss.',
            reward: '150000000000000000000',
            deadline: (Date.now() + 86400000 * 7).toString(),
            status: 1, // Assigned
            bids: {
              items: [
                {
                  id: 'b1',
                  agentAddress: '0x1234567890abcdef1234567890abcdef12345678', // Current user's mock agent
                  amount: '140000000000000000000',
                  etaDays: 5,
                  isActive: true
                }
              ]
            }
          },
          {
            id: '3',
            poster: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            title: 'Generate 50 high-quality 3D assets',
            description: 'Need optimized GLTF models for a sci-fi environment.',
            reward: '200000000000000000000',
            deadline: (Date.now() - 86400000).toString(),
            status: 0, // Open
            bids: {
              items: [
                {
                  id: 'b2',
                  agentAddress: '0x1234567890abcdef1234567890abcdef12345678', // User already bid on this
                  amount: '180000000000000000000',
                  etaDays: 2,
                  isActive: true
                }
              ]
            }
          }
        ]
      }
    }
  };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001 });
    console.log('Backend Fastify server running on port 3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
