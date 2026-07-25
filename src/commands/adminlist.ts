import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { dbService } from '../services/db.service';

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

    const pendingRequests = dbService.getPendingRequests();

    if (pendingRequests.length === 0) {
      await interaction.editReply({
        content: '✅ **אין בקשות חדשות הממתינות לאישור במערכת כרגע.**',
      });
      return;
    }

    let replyContent = `📋 **בקשות רישום הממתינות לאישור במערכת (${pendingRequests.length}):**\n\n`;

    pendingRequests.forEach((req, index) => {
      const subdomain = req.data?.subdomain || 'לא ידוע';
      const type = req.data?.targetType || 'A';
      const value = req.data?.targetValue || '';
      const desc = req.data?.description || 'אין תיאור';

      replyContent += `**${index + 1}. \`${subdomain}.מפתח.ישראל\`**\n`;
      replyContent += `• משתמש: \`${req.username}\` (ID: ${req.discordId})\n`;
      replyContent += `• סוג רשומה: \`${type}\` | ערך: \`${value}\`\n`;
      replyContent += `• תיאור פרויקט: *${desc}*\n`;
      replyContent += `• מזהה בקשה: \`${req.id}\`\n`;
      replyContent += `• לאישור: \`/adminapprove request_id:${req.id}\` | לדחייה: \`/adminreject request_id:${req.id}\`\n\n`;
    });

    await interaction.editReply({
      content: replyContent,
    });
  },
};
