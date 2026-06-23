import { Client, GatewayIntentBits } from 'discord.js';
import { logger } from '@mifal-israel/utils';
import { readyEvent } from './events/ready';
import { interactionCreateEvent } from './events/interactionCreate';
import { OpenFeature } from '@openfeature/server-sdk';
import { CustomProviderServer } from '@mifal-israel/feature-flags';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

if (!token) {
  logger.error('DISCORD_TOKEN is not defined in environment variables.');
  process.exit(1);
}

// Initialize OpenFeature
OpenFeature.setProvider(new CustomProviderServer(backendUrl));
logger.info('OpenFeature provider initialized');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Register events
client.once(readyEvent.name as any, (...args: any[]) => readyEvent.execute(args[0] as any));
client.on(interactionCreateEvent.name as any, (...args: any[]) => interactionCreateEvent.execute(args[0] as any));

client.login(token).catch((error) => {
  logger.error({ error }, 'Failed to login to Discord');
  process.exit(1);
});
