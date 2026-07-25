import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const contactCommand = {
  data: new SlashCommandBuilder()
    .setName('contact')
    .setDescription('פרטי יצירת קשר עם צוות מפתח.ישראל.'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      content:
        '📬 **יצירת קשר עם צוות מפתח.ישראל:**\n\n' +
        '• **דיסקורד:** פתח פנייה בשרת או פנה למנהלים.\n' +
        '• **אתר:** https://מפתח.ישראל/\n' +
        '• **גיטהאב:** https://github.com/mefateach-israel',
      ephemeral: true,
    });
  },
};
