import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { dbService } from '../services/db.service';

export const adminrejectCommand = {
  data: new SlashCommandBuilder()
    .setName('adminreject')
    .setDescription('דחה בקשת רישום תת-דומיין (מנהל מערכת בלבד).')
    .addStringOption((option) =>
      option
        .setName('request_id')
        .setDescription('מזהה הבקשה לדחייה')
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

    const updated = dbService.updateRequestStatus(requestId, 'REJECTED');

    if (!updated) {
      await interaction.editReply({
        content: `❌ **בקשה במזהה \`${requestId}\` לא נמצאה במערכת.**`,
      });
      return;
    }

    await interaction.editReply({
      content: `🔴 **הבקשה \`${requestId}\` עבור \`${updated.data.subdomain}.מפתח.ישראל\` נדחתה.**`,
    });
  },
};
