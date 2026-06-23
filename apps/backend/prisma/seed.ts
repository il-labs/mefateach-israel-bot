import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const flags = [
    {
      key: 'enable_bot_commands',
      description: 'Enables general bot commands like about and faq',
      value: true,
      enabled: true,
    },
    {
      key: 'bot-status-command',
      description: 'Enables the status command for the bot',
      value: true,
      enabled: true,
    },
    {
      key: 'maintenance-mode',
      description: 'Enables maintenance mode for the application',
      value: false,
      enabled: true,
    },
    {
      key: 'new-ui-v2',
      description: 'Enables the new UI v2',
      value: false,
      enabled: true,
    },
    {
      key: 'beta-features',
      description: 'Enables beta features',
      value: false,
      enabled: true,
    },
    {
      key: 'api-v2-enabled',
      description: 'Enables API v2',
      value: false,
      enabled: true,
    },
    {
      key: 'discord-bot-monitoring',
      description: 'Enables discord bot monitoring',
      value: true,
      enabled: true,
    },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: flag,
    });
  }

  console.log('Database seeded with default feature flags.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
