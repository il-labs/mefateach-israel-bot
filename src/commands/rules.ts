import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const rulesCommand = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('חוקי השימוש והקהילה של מפתח.ישראל.'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      content:
        '📜 **חוקי תת-הדומיינים והקהילה:**\n\n' +
        '1. אין להשתמש בתת-דומיינים למטרות פישינג, ספאם או תוכן לא חוקי.\n' +
        '2. אין לבצע שימוש לרעה במשאבי השרת.\n' +
        '3. שמר על שיח מכבד בערוצי הקהילה.\n' +
        '4. מנהלי המערכת שומרים את הזכות לבטל תת-דומיין במידה והופרו החוקים.',
      ephemeral: true,
    });
  },
};
