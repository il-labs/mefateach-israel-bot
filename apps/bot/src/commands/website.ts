import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const websiteCommand = {
  data: new SlashCommandBuilder()
    .setName('website')
    .setDescription('קבל קישור לאתר הבית של מפתח.ישראל.'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      content: '🔗 **אתר הבית הרשמי של מפתח.ישראל:** https://מפתח.ישראל/\n\nבאתר תוכלו למצוא מידע נוסף, מדריכים וכלים למפתחים ישראלים.',
      ephemeral: true,
    });
  },
};
