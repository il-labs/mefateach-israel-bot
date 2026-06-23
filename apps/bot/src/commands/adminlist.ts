import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

export const adminlistCommand = {
  data: new SlashCommandBuilder()
    .setName('adminlist')
    .setDescription('הצג בקשות רישום תת-דומיינים הממתינות לאישור (מנהל מערכת בלבד).')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({
        content: '❌ אין לך הרשאות מנהל מערכת לביצוע פקודה זו.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const reqRes = await fetch(`${backendUrl}/api/requests`);
      if (!reqRes.ok) throw new Error('נכשלה הבאת הבקשות מהשרת');
      const allRequests = await reqRes.json() as any[];

      const pendingRequests = allRequests.filter(r => r.status === 'PENDING');

      if (pendingRequests.length === 0) {
        await interaction.editReply({
          content: '✅ **אין בקשות חדשות הממתינות לאישור במערכת כרגע.**',
        });
        return;
      }

      let replyContent = `📋 **בקשות רישום הממתינות לאישור במערכת (${pendingRequests.length}):**\n\n`;

      pendingRequests.forEach((req, index) => {
        const reqData = typeof req.data === 'string' ? JSON.parse(req.data) : req.data;
        const subdomain = reqData?.subdomain || 'לא ידוע';
        const type = reqData?.targetType || 'A';
        const value = reqData?.targetValue || '';
        const desc = reqData?.description || 'אין תיאור';

        replyContent += `**${index + 1}. \`${subdomain}.מפתח.ישראל\`**\n`;
        replyContent += `• סוג רשומה: \`${type}\` | ערך: \`${value}\`\n`;
        replyContent += `• תיאור פרויקט: *${desc}*\n`;
        replyContent += `• מזהה בקשה לאישור: \`${req.id}\`\n`;
        replyContent += `• לאישור מהיר: \`/adminapprove request_id:${req.id}\`\n\n`;
      });

      await interaction.editReply({
        content: replyContent,
      });

    } catch (err: any) {
      await interaction.editReply({
        content: `⚠️ **שגיאה בתקשורת עם שרת הבקאנד.**\n\n• שגיאה: ${err.message}`,
      });
    }
  },
};
