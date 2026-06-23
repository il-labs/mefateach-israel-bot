import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const helpCommand = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('הצג את רשימת הפקודות הזמינות של מפתח.ישראל.'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      content: `📚 **פקודות זמינות בבוט מפתח.ישראל:**\n\n• \`/about\` - מידע על פרויקט מפתח.ישראל\n• \`/website\` - קישור לאתר הבית הרשמי\n• \`/faq\` - שאלות ותשובות נפוצות\n• \`/rules\` - חוקי השימוש והרישום לתתי-דומיינים\n• \`/contact\` - דרכי יצירת קשר ותמיכה טכנית\n• \`/request\` - שליחת בקשה חדשה לרישום תת-דומיין\n• \`/myrequests\` - הצגת בקשות הרישום שהגשת\n• \`/status\` - בדיקת סטטוס השירותים ומסד הנתונים\n• \`/ping\` - בדיקת מהירות החיבור של הבוט\n• \`/help\` - הצגת תפריט עזרה זה\n\n👑 **פקודות ניהול (מנהלי מערכת בלבד):**\n• \`/adminlist\` - הצג את כל הבקשות הממתינות לאישור\n• \`/adminapprove\` - אישור בקשת תת-דומיין לפי מזהה\n• \`/adminreject\` - דחיית בקשת תת-דומיין לפי מזהה`,
      ephemeral: true,
    });
  },
};
