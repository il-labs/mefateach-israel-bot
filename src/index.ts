import { Client, GatewayIntentBits } from 'discord.js';
import { logger } from './utils/logger';
import { readyEvent } from './events/ready';
import { interactionCreateEvent } from './events/interactionCreate';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.DISCORD_TOKEN;

if (!token) {
  logger.error('DISCORD_TOKEN is not defined in environment variables.');
  logger.info('Please create a .env file with your DISCORD_TOKEN, DISCORD_CLIENT_ID, and DISCORD_GUILD_ID.');
  process.exit(1);
}

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
