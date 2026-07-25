import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbService } from '../services/db.service';

const RESERVED_SUBDOMAINS = new Set([
  'www', 'admin', 'api', 'bot', 'mail', 'dns', 'root', 'mefateach', 'israel',
  'dashboard', 'app', 'dev', 'test', 'stage', 'staging', 'prod', 'production'
]);

export const requestCommand = {
  data: new SlashCommandBuilder()
    .setName('request')
    .setDescription('שלח בקשה חדשה לרישום תת-דומיין במפתח.ישראל.')
    .addStringOption((option) =>
      option
        .setName('subdomain')
        .setDescription('שם התת-דומיין המבוקש (למשל: myproject)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('סוג רשומת ה-DNS')
        .setRequired(true)
        .addChoices(
          { name: 'A (כתובת IP)', value: 'A' },
          { name: 'CNAME (שם שרת הפניה)', value: 'CNAME' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('value')
        .setDescription('ערך הרשומה (למשל: 1.2.3.4 או server.com)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('description')
        .setDescription('תיאור קצר של הפרויקט שלך')
        .setRequired(true)
    ),
  featureFlag: 'enable_bot_commands',
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const subdomain = interaction.options.getString('subdomain', true).trim().toLowerCase();
    const type = interaction.options.getString('type', true);
    const value = interaction.options.getString('value', true).trim();
    const description = interaction.options.getString('description', true).trim();

    // 1. Validation
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain) || subdomain.length < 2 || subdomain.length > 63) {
      await interaction.editReply({
        content: `❌ **שם תת-הדומיין אינו תקין.**\n• השם חייב להכיל באנגגלית אותיות קטנות, מספרים או מקפים בלבד (באורך 2 עד 63 תווים).`,
      });
      return;
    }

    if (RESERVED_SUBDOMAINS.has(subdomain)) {
      await interaction.editReply({
        content: `❌ **שם תת-הדומיין \`${subdomain}\` שמור ולא ניתן לרישום.**`,
      });
      return;
    }

    if (dbService.isSubdomainTaken(subdomain)) {
      await interaction.editReply({
        content: `❌ **תת-הדומיין \`${subdomain}.מפתח.ישראל\` כבר תפוס או שממתין לאישור במערכת.**`,
      });
      return;
    }

    try {
      const createdRequest = dbService.createRequest({
        discordId: interaction.user.id,
        username: interaction.user.username,
        subdomain,
        targetType: type,
        targetValue: value,
        description,
      });

      await interaction.editReply({
        content:
          `🎉 **בקשתך נקלטה בהצלחה במערכת!**\n\n` +
          `• **תת-דומיין מבוקש:** \`${subdomain}.מפתח.ישראל\`\n` +
          `• **סוג רשומה:** \`${type}\`\n` +
          `• **ערך רשומה:** \`${value}\`\n` +
          `• **מזהה בקשה:** \`${createdRequest.id}\`\n\n` +
          `הבקשה הועברה לבדיקת מנהל מערכת. תוכל לעקוב אחר סטטוס הבקשה באמצעות פקודת \`/myrequests\`.`,
      });
    } catch (err: any) {
      await interaction.editReply({
        content: `❌ **אירעה שגיאה בעת שמירת הבקשה במערכת.**\n• פרטי השגיאה: ${err.message || 'שגיאה לא ידועה'}`,
      });
    }
  },
};
