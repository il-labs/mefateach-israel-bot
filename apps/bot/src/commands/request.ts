import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

export const requestCommand = {
  data: new SlashCommandBuilder()
    .setName('request')
    .setDescription('שלח בקשה חדשה לרישום תת-דומיין במפתח.ישראל.')
    .addStringOption(option =>
      option.setName('subdomain')
        .setDescription('שם התת-דומיין המבוקש (למשל: myproject)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('type')
        .setDescription('סוג רשומת ה-DNS')
        .setRequired(true)
        .addChoices(
          { name: 'A (כתובת IP)', value: 'A' },
          { name: 'CNAME (שם שרת הפניה)', value: 'CNAME' }
        )
    )
    .addStringOption(option =>
      option.setName('value')
        .setDescription('ערך הרשומה (למשל: 1.2.3.4 או server.com)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('description')
        .setDescription('תיאור קצר של הפרויקט שלך')
        .setRequired(true)
    ),
  featureFlag: 'enable_bot_commands',
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const subdomain = interaction.options.getString('subdomain', true).trim().toLowerCase();
    const type = interaction.options.getString('type', true);
    const value = interaction.options.getString('value', true).trim();
    const description = interaction.options.getString('description', true);

    try {
      // 1. Get or create user in DB by Discord ID
      const userRes = await fetch(`${backendUrl}/api/users/discord/${interaction.user.id}?name=${encodeURIComponent(interaction.user.username)}`);
      if (!userRes.ok) throw new Error('נכשלה הבאת פרטי המשתמש ממסד הנתונים');
      const user = await userRes.json() as { id: string };

      // 2. Validate subdomain
      const valRes = await fetch(`${backendUrl}/api/requests/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain }),
      });

      if (!valRes.ok) throw new Error('שגיאה בחיבור לשירות האימות');
      const validation = await valRes.json() as { valid: boolean; error?: string };

      if (!validation.valid) {
        await interaction.editReply({
          content: `❌ **הבקשה נדחתה עקב שגיאת אימות:**\n• ${validation.error || 'שם הדומיין אינו תקין'}`,
        });
        return;
      }

      // 3. Submit request to backend
      const reqRes = await fetch(`${backendUrl}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: 'SUBDOMAIN',
          data: {
            subdomain,
            targetType: type,
            targetValue: value,
            description,
          },
        }),
      });

      if (!reqRes.ok) throw new Error('כשלה יצירת בקשת הרישום בשרת');
      const createdRequest = await reqRes.json() as { id: string };

      await interaction.editReply({
        content: `🎉 **בקשתך נקלטה בהצלחה במערכת!**\n\n• **תת-דומיין מבוקש:** \`${subdomain}.מפתח.ישראל\`\n• **סוג רשומה:** \`${type}\`\n• **ערך רשומה:** \`${value}\`\n• **מזהה בקשה:** \`${createdRequest.id}\`\n\nהבקשה הועברה לבדיקת מנהל מערכת. תוכל לעקוב אחר סטטוס הבקשה באמצעות פקודת \`/myrequests\` או באתר.`,
      });

    } catch (err: any) {
      await interaction.editReply({
        content: `⚠️ **שרת הבקאנד של מפתח.ישראל אינו זמין כעת.**\n\n• פקודת הרישום דורשת חיבור פעיל לבקאנד ולמסד הנתונים.\n• אנא נסה שוב מאוחר יותר כאשר השירות יחזור לפעילות.`,
      });
    }
  },
};
