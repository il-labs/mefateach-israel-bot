# Mefateach Israel Discord Bot

בוט Discord רשמי ועצמאי עבור קהילת **מפתח.ישראל**.

## 🚀 תכונות הבוט

- 🌐 **בקשת תת-דומיינים (`/request`):** הגשת בקשות לרישום תת-דומיין חדש תחת `מפתח.ישראל`.
- 📋 **הצגת בקשות אישיות (`/myrequests`):** צפייה בסטטוס הבקשות שהוגשו על ידי המשתמש.
- 👑 **ניהול מנהלים (`/adminlist`, `/adminapprove`, `/adminreject`):** צפייה, אישור ודחייה של בקשות על ידי מנהלי המערכת.
- ℹ️ **מידע וקהילה (`/about`, `/rules`, `/faq`, `/contact`, `/website`, `/ping`, `/status`, `/help`).**

## 🛠️ דרישות מוקדמות

- Node.js (גרסה 18 ומעלה)
- npm / pnpm / yarn

## 🔧 התקנה והרצה

1. **התקנת תלויות:**
   ```bash
   npm install
   ```

2. **הגדרת משתני סביבה:**
   העתק את הקובץ `.env.example` לקובץ `.env` ומלא את פרטי הבוט של דיסקורד:
   ```env
   DISCORD_TOKEN=your_token
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_GUILD_ID=your_guild_id
   ```

3. **הרצה במצב פיתוח:**
   ```bash
   npm run dev
   ```

4. **בנייה והרצה בייצור (Production):**
   ```bash
   npm run build
   npm start
   ```

## 🐳 הרצה עם Docker

```bash
docker-compose up --build -d
```
