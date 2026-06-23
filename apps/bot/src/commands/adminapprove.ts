import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

export const adminapproveCommand = {
  data: new SlashCommandBuilder()
    .setName('adminapprove')
    .setDescription('אשר בקשת רישום תת-דומיין (מנהל מערכת בלבד).')
    .addStringOption(option =>
      option.setName('request_id')
        .setDescription('מזהה הבקשה לאישור')
        .setRequired(true)
    )
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

    const requestId = interaction.options.getString('request_id', true).trim();

    try {
      const response = await fetch(`${backendUrl}/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      if (!response.ok) throw new Error('העדכון נכשל בשרת הבקאנד');

      await interaction.editReply({
        content: `🟢 **הבקשה \`${requestId}\` אושרה בהצלחה!**\n\nתת-הדומיין עודכן לסטטוס מאושר במערכת.`,
      });

    } catch (err: any) {
      await interaction.editReply({
        content: `⚠️ **שגיאה בעדכון הבקשה.**\n\n• שגיאה: ${err.message}`,
      });
    }
  },
};
