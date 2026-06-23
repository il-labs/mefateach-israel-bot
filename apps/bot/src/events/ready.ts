import { Client, Events, REST, Routes } from 'discord.js';
import { OpenFeature } from '@openfeature/server-sdk';
import { CustomProviderServer } from '@mifal-israel/feature-flags';
import { logger } from '@mifal-israel/utils';
import { commands } from '../commands';
import dotenv from 'dotenv';

dotenv.config();

export const readyEvent = {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    logger.info(`Logged in as ${client.user?.tag}!`);

    // Initialize OpenFeature
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    try {
      await OpenFeature.setProviderAndWait(new CustomProviderServer(backendUrl));
      logger.info('OpenFeature provider initialized successfully.');
    } catch (ofError: any) {
      logger.warn(`OpenFeature provider failed to initialize (Backend offline: ${ofError.message || 'connection error'}). Falling back to defaults.`);
    }

    // Register Slash Commands
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

    try {
      logger.info('Started refreshing application (/) commands.');

      const commandData = commands.map((command) => command.data.toJSON());

      // Clear global commands to prevent duplicates on the server
      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
        { body: [] }
      );

      logger.info('Successfully cleared global application (/) commands to avoid duplicates.');

      // Also register commands in all guilds the bot is currently in for instant updates
      try {
        const guilds = await client.guilds.fetch();
        for (const [guildId] of guilds) {
          try {
            await rest.put(
              Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, guildId),
              { body: commandData }
            );
            logger.info(`Successfully reloaded commands for guild: ${guildId}`);
          } catch (guildError) {
            logger.error({ guildError, guildId }, 'Error refreshing guild commands');
          }
        }

        // Add explicit registration for guild ID from env if not already covered
        const envGuildId = process.env.DISCORD_GUILD_ID;
        if (envGuildId && !guilds.has(envGuildId)) {
          try {
            await rest.put(
              Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, envGuildId),
              { body: commandData }
            );
            logger.info(`Successfully reloaded commands for env guild: ${envGuildId}`);
          } catch (envGuildError) {
            logger.error({ envGuildError, guildId: envGuildId }, 'Error refreshing env guild commands');
          }
        }
      } catch (guildsFetchError) {
        logger.error({ guildsFetchError }, 'Failed to fetch guilds for guild-level command registration');
      }
    } catch (error) {
      logger.error({ error }, 'Error refreshing application commands');
    }

    // Health check interval to update bot activity/presence
    const updatePresence = async () => {
      try {
        const response = await fetch(`${backendUrl}/health`, { signal: AbortSignal.timeout(5000) });
        if (response.ok) {
          const data = (await response.json()) as { status?: string };
          if (data.status === 'OK') {
            client.user?.setPresence({
              activities: [{ name: 'מפתח.ישראל 🟢' }],
              status: 'online',
            });
            return;
          }
        }
        client.user?.setPresence({
          activities: [{ name: '⚠️ שרת הבקאנד לא זמין' }],
          status: 'dnd',
        });
      } catch (err) {
        client.user?.setPresence({
          activities: [{ name: '🔴 שרת הבקאנד לא זמין' }],
          status: 'dnd',
        });
      }
    };

    updatePresence();
    setInterval(updatePresence, 30000);
  },
};
