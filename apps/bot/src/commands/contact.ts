import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const contactCommand = {
  data: new SlashCommandBuilder()
    .setName('contact')
    .setDescription('דרכי יצירת קשר ותמיכה טכנית.'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      content: `📞 **יצירת קשר ותמיכה - מפתח.ישראל:**

צריכים עזרה עם תת-הדומיין שלכם? יש לכם הצעה לשיפור או פרויקט שתרצו לשתף איתנו?

💬 **בשרת הדיסקורד:**
תוכלו לפתוח פנייה בערוץ התמיכה הייעודי או לפנות ישירות לאחד מחברי צוות המנהלים (**Admins**).

🌐 **באתר הבית:**
תוכלו לבקר באתר הבית הרשמי שלנו בכתובת https://מפתח.ישראל/ ולהשתמש בטופס יצירת הקשר.

💻 **ב-GitHub:**
מצאתם באג? רוצים להציע קוד חדש? פתחו Issue או Pull Request בארגון ה-GitHub שלנו:
https://github.com/il-labs

אנחנו זמינים ונשמח לעזור לכם להרים את הפרויקט שלכם לאוויר!`,
      ephemeral: true,
    });
  },
};
