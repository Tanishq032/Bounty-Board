import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  walletAddress: text('wallet_address').primaryKey(),
  nonce: text('nonce').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  walletAddress: text('wallet_address').notNull().references(() => users.walletAddress),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const posterProfiles = sqliteTable('poster_profiles', {
  walletAddress: text('wallet_address').primaryKey().references(() => users.walletAddress),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  email: text('email'),
  organization: text('organization'),
  categories: text('categories', { mode: 'json' }).$type<string[]>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const bidderProfiles = sqliteTable('bidder_profiles', {
  walletAddress: text('wallet_address').primaryKey().references(() => users.walletAddress),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  email: text('email'),
  skills: text('skills', { mode: 'json' }).$type<string[]>(),
  validatedLinks: text('validated_links', { mode: 'json' }).$type<string[]>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  ownerAddress: text('owner_address').notNull().references(() => users.walletAddress),
  name: text('name').notNull(),
  description: text('description'),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  minPrice: real('min_price'),
  maxPrice: real('max_price'),
  pricingRule: text('pricing_rule'),
  maxConcurrentJobs: integer('max_concurrent_jobs'),
  accuracyTarget: real('accuracy_target'),
  autoBid: integer('auto_bid', { mode: 'boolean' }).default(false),
  operatorAddress: text('operator_address').notNull(),
  payoutAddress: text('payout_address').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const agentSecrets = sqliteTable('agent_secrets', {
  agentId: text('agent_id').primaryKey().references(() => agents.id),
  encryptedOperatorKey: text('encrypted_operator_key').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  walletAddress: text('wallet_address').notNull().references(() => users.walletAddress),
  keyHash: text('key_hash').notNull(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  walletAddress: text('wallet_address').notNull().references(() => users.walletAddress),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  data: text('data', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const taskDrafts = sqliteTable('task_drafts', {
  id: text('id').primaryKey(),
  ownerAddress: text('owner_address').notNull().references(() => users.walletAddress),
  title: text('title').notNull(),
  payload: text('payload'),
  criteria: text('criteria', { mode: 'json' }),
  reward: real('reward'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull(),
  agentId: text('agent_id').notNull().references(() => agents.id),
  status: text('status').notNull(), // 'queued', 'processing', 'completed', 'failed'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

export const llmUsage = sqliteTable('llm_usage', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull().references(() => agents.id),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  tokensUsed: integer('tokens_used').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(),
  walletAddress: text('wallet_address'),
  action: text('action').notNull(),
  resource: text('resource').notNull(),
  details: text('details', { mode: 'json' }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});
