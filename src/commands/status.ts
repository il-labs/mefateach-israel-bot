import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbService } from '../services/db.service';

export const statusCommand = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('בדוק את הסטטוס של הבוט ונתוני המערכת.'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const stats = dbService.getStats();
    const wsPing = interaction.client.ws.ping;

    await interaction.editReply({
      content:
        `🟢 **בוט מפתח.ישראל פעיל ומחובר!**\n\n` +
        `• **זמן תגובת WebSocket:** \`${wsPing}ms\`\n` +
        `• **סה"כ בקשות במערכת:** \`${stats.totalRequests}\`\n` +
        `• **בקשות ממתינות לאישור:** \`${stats.pending}\`\n` +
        `• **בקשות שאושרו:** \`${stats.approved}\`\n` +
        `• **בקשות שנדחו:** \`${stats.rejected}\``,
    });
  },
};
