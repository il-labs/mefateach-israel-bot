import { Client, Events, REST, Routes } from 'discord.js';
import { logger } from '../utils/logger';
import { commands } from '../commands';
import dotenv from 'dotenv';

dotenv.config();

export const readyEvent = {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    logger.info(`Logged in as ${client.user?.tag}!`);

    // Set activity
    client.user?.setPresence({
      activities: [{ name: 'מפתח.ישראל 🟢' }],
      status: 'online',
    });

    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.DISCORD_CLIENT_ID;

    if (!token || !clientId) {
      logger.warn('DISCORD_TOKEN or DISCORD_CLIENT_ID missing; skipping slash command registration.');
      return;
    }

    // Register Slash Commands
    const rest = new REST({ version: '10' }).setToken(token);

    try {
      logger.info('Started refreshing application (/) commands.');

      const commandData = commands.map((command) => command.data.toJSON());

      // Register global commands
      await rest.put(Routes.applicationCommands(clientId), {
        body: commandData,
      });

      logger.info('Successfully updated global application (/) commands.');

      // Also update guild commands if DISCORD_GUILD_ID is provided
      const guildId = process.env.DISCORD_GUILD_ID;
      if (guildId) {
        try {
          await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commandData,
          });
          logger.info(`Successfully reloaded commands for guild: ${guildId}`);
        } catch (guildError) {
          logger.error({ guildError, guildId }, 'Error refreshing guild commands');
        }
      }
    } catch (error) {
      logger.error({ error }, 'Error refreshing application commands');
    }
  },
};
