import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const websiteCommand = {
  data: new SlashCommandBuilder()
    .setName('website')
    .setDescription('קישור לאתר הרשמי של מפתח.ישראל.'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      content: '🌐 **האתר הרשמי:** https://מפתח.ישראל/',
      ephemeral: true,
    });
  },
};
