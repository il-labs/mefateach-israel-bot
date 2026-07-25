import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const helpCommand = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('הצג את רשימת הפקודות הזמינות בבוט.'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      content:
        '🤖 **פקודות בוט מפתח.ישראל:**\n\n' +
        '• `/request` - שלח בקשה לרישום תת-דומיין חדש\n' +
        '• `/myrequests` - צפה בסטטוס הבקשות שהגשת\n' +
        '• `/status` - בדוק את סטטוס הבוט ונתוני הרישום\n' +
        '• `/ping` - בדיקת מהירות תגובת הבוט\n' +
        '• `/about` - מידע על פרויקט מפתח.ישראל\n' +
        '• `/rules` - תקנון וחוקי השימוש\n' +
        '• `/faq` - שאלות נפוצות ותשובות\n' +
        '• `/contact` - יצירת קשר עם המנהלים\n' +
        '• `/website` - קישור לאתר הפרויקט\n\n' +
        '👑 **פקודות מנהלים:**\n' +
        '• `/adminlist` - הצגת בקשות הממתינות לאישור\n' +
        '• `/adminapprove` - אישור בקשת תת-דומיין\n' +
        '• `/adminreject` - דחיית בקשת תת-דומיין',
      ephemeral: true,
    });
  },
};
