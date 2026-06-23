import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

export const myrequestsCommand = {
  data: new SlashCommandBuilder()
    .setName('myrequests')
    .setDescription('הצג את בקשות רישום תת-הדומיינים שהגשת.'),
  featureFlag: 'enable_bot_commands',
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // 1. Get or create user
      const userRes = await fetch(`${backendUrl}/api/users/discord/${interaction.user.id}`);
      if (!userRes.ok) throw new Error('נכשלה הבאת פרטי המשתמש ממסד הנתונים');
      const user = await userRes.json() as { id: string };

      // 2. Get all requests
      const reqRes = await fetch(`${backendUrl}/api/requests`);
      if (!reqRes.ok) throw new Error('נכשלה הבאת הבקשות מהשרת');
      const allRequests = await reqRes.json() as any[];

      // Filter requests belonging to this user
      const userRequests = allRequests.filter(r => r.userId === user.id);

      if (userRequests.length === 0) {
        await interaction.editReply({
          content: 'ℹ️ **לא נמצאו בקשות רישום תת-דומיינים המשויכות אליך במערכת.**\n\nתוכל לשלוח בקשה חדשה באמצעות פקודת `/request`.',
        });
        return;
      }

      const statusMap: Record<string, string> = {
        PENDING: '⏳ בבדיקה',
        APPROVED: '🟢 אושר',
        REJECTED: '🔴 נדחה',
        NEEDS_CHANGES: '⚠️ דרוש שינוי'
      };

      let replyContent = `📋 **בקשות הרישום שלך במערכת מפתח.ישראל (${userRequests.length}):**\n\n`;

      userRequests.forEach((req, index) => {
        const reqData = req.data as any;
        const subdomain = reqData?.subdomain || 'לא ידוע';
        const type = reqData?.targetType || 'A';
        const value = reqData?.targetValue || '';
        const status = statusMap[req.status] || req.status;

        replyContent += `**${index + 1}. ${subdomain}.מפתח.ישראל**\n`;
        replyContent += `• סוג רשומה: \`${type}\` | ערך: \`${value}\`\n`;
        replyContent += `• סטטוס: **${status}**\n`;
        replyContent += `• מזהה בקשה: \`${req.id}\`\n\n`;
      });

      await interaction.editReply({
        content: replyContent,
      });

    } catch (err: any) {
      await interaction.editReply({
        content: `⚠️ **שרת הבקאנד של מפתח.ישראל אינו זמין כעת.**\n\n• הצגת הבקשות שלך דורשת חיבור פעיל לבקאנד ולמסד הנתונים.\n• אנא נסה שוב מאוחר יותר כאשר השירות יחזור לפעילות.`,
      });
    }
  },
};
