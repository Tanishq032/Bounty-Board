import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const dbPath = process.env.DATABASE_URL || `file:${path.resolve(__dirname, '../../../../bounty-board-app.db')}`;
console.log('Using DB Path:', dbPath);
const client = createClient({ url: dbPath });
export const db = drizzle(client, { schema });
