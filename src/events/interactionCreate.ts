import { Events, Interaction } from 'discord.js';
import { logger } from '../utils/logger';
import { commands } from '../commands';
import { checkFeatureFlag } from '../middleware/feature-flag.middleware';

export const interactionCreateEvent = {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);

    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      if (command.featureFlag) {
        const isEnabled = await checkFeatureFlag(command.featureFlag, true);

        if (!isEnabled) {
          await interaction.reply({
            content: '❌ הפקודה הזו מנוטרלת כעת במערכת.',
            ephemeral: true,
          });
          return;
        }
      }

      await command.execute(interaction);
    } catch (error) {
      logger.error({ error, commandName: interaction.commandName }, 'Error executing command');
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '❌ אירעה שגיאה בעת הרצת הפקודה הזו!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: '❌ אירעה שגיאה בעת הרצת הפקודה הזו!',
          ephemeral: true,
        });
      }
    }
  },
};
