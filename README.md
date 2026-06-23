# Mifal Israel Monorepo

This is a monorepo for the Mifal Israel project, featuring a backend API, a Discord bot, and a frontend application.

## Structure

- `apps/backend`: Express.js API with Prisma and OpenFeature.
- `apps/bot`: Discord bot using discord.js.
- `apps/frontend`: Next.js application.
- `packages/api-client`: Shared API client for frontend and bot.
- `packages/feature-flags`: Shared feature flag configuration and providers.
- `packages/shared-types`: Shared TypeScript types.
- `packages/utils`: Shared utility functions and logger.
- `infrastructure/docker`: Docker and Docker Compose configuration.
- `infrastructure/scripts`: Maintenance and automation scripts.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) and Docker Compose

## Getting Started

### Local Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env` in `apps/backend` and `apps/bot`, and fill in the required values.

3. Run the development environment:
   ```bash
   pnpm dev
   ```

### Docker

To run the entire stack using Docker:

```bash
docker-compose -f infrastructure/docker/docker-compose.yml up --build
```

## Infrastructure

### Auto-Commit Script

A script is provided to automatically commit changes as you work. This is useful for development environments where you want to keep a granular history of changes.

To run the auto-commit script:

```bash
cd infrastructure/scripts
pnpm install
pnpm auto-commit
```

## License

Private.
