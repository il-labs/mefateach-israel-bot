import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

export const statusCommand = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('בדוק את הסטטוס של שירותי מפתח.ישראל.'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const startTime = Date.now();
      const response = await fetch(`${backendUrl}/health`);
      const latency = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json() as { status?: string };
        if (data.status === 'OK') {
          await interaction.editReply({
            content: `🟢 **כל המערכות פועלות כסדרן!**\n\n• **שרת ה-Backend:** פעיל (זמן תגובה: ${latency}ms)\n• **מסד הנתונים:** מחובר ופעיל\n• **הבוט:** מחובר לשרת ה-Discord`,
          });
          return;
        }
      }
      
      await interaction.editReply({
        content: `⚠️ **חלק מהמערכות חוות בעיות כרגע.**\n\n• שרת ה-Backend החזיר קוד שגיאה: ${response.status}`,
      });
    } catch (error: any) {
      await interaction.editReply({
        content: `⚠️ **שרת הבקאנד של מפתח.ישראל אינו זמין כעת.**\n\n• **שרת ה-Backend:** 🔴 מנותק\n• **מסד הנתונים:** 🔴 לא זמין\n• **בוט הדיסקורד:** 🟢 פעיל ומחובר ל-Discord\n\nאנא נסה שוב מאוחר יותר כאשר שירותי הבקאנד יחזרו לפעילות.`,
      });
    }
  },
};
