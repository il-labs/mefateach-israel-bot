import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const aboutCommand = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('מידע על מפתח.ישראל והפעילות שלנו.'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      content: 'מפתח.ישראל הוא פרויקט קהילתי לפיתוח כלים ופלטפורמות קוד פתוח עבור קהילת המפתחים בישראל. 🇮🇱\n\n🔗 **אתר הבית שלנו:** https://מפתח.ישראל/',
      ephemeral: true,
    });
  },
};
