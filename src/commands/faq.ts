import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const faqCommand = {
  data: new SlashCommandBuilder()
    .setName('faq')
    .setDescription('שאלות נפוצות בנושא מפתח.ישראל ורישום תת-דומיינים.'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      content:
        '❓ **שאלות נפוצות (FAQ):**\n\n' +
        '1️⃣ **מה זה מפתח.ישראל?**\n' +
        'פרויקט קהילתי המאפשר למפתחים ישראלים לקבל תת-דומיין חינמי תחת `מפתח.ישראל`.\n\n' +
        '2️⃣ **איך מבקשים תת-דומיין?**\n' +
        'משתמשים בפקודה `/request` וממלאים את השם והפרטים המבוקשים.\n\n' +
        '3️⃣ **כמה זמן לוקח לאשר בקשה?**\n' +
        'בדרך כלל עד 24 שעות ממועד הגשת הבקשה.',
      ephemeral: true,
    });
  },
};
