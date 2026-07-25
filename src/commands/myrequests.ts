import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbService } from '../services/db.service';

export const myrequestsCommand = {
  data: new SlashCommandBuilder()
    .setName('myrequests')
    .setDescription('הצג את בקשות רישום תת-הדומיינים שהגשת.'),
  featureFlag: 'enable_bot_commands',
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const userRequests = dbService.getUserRequests(interaction.user.id);

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
    };

    let replyContent = `📋 **בקשות הרישום שלך במערכת מפתח.ישראל (${userRequests.length}):**\n\n`;

    userRequests.forEach((req, index) => {
      const subdomain = req.data?.subdomain || 'לא ידוע';
      const type = req.data?.targetType || 'A';
      const value = req.data?.targetValue || '';
      const status = statusMap[req.status] || req.status;

      replyContent += `**${index + 1}. ${subdomain}.מפתח.ישראל**\n`;
      replyContent += `• סוג רשומה: \`${type}\` | ערך: \`${value}\`\n`;
      replyContent += `• סטטוס: **${status}**\n`;
      replyContent += `• מזהה בקשה: \`${req.id}\`\n\n`;
    });

    await interaction.editReply({
      content: replyContent,
    });
  },
};
