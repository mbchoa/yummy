# yummy

A personal restaurant and dish journal. Search restaurants through the Yelp Fusion API, save the ones you like or dislike, and keep a list of the dishes you've tried at each one with a thumbs up or down. You can add collaborators who can view and edit your list.

Built with Next.js (pages router), tRPC, Prisma (Postgres), NextAuth (Auth0) and Tailwind CSS. Yelp responses are cached in Redis.

## Local setup

Requirements: Node 22+, pnpm and Docker.

1. Install dependencies:

   ```shell
   pnpm install
   ```

2. Copy `.env.example` to `.env` and fill in the secrets: Auth0 application credentials (`AUTH0_*`), a `YELP_API_KEY`, and a `NEXTAUTH_SECRET` (`openssl rand -base64 32`).

3. Start Postgres and Redis and apply the migrations. See [prisma/README.md](prisma/README.md). The default `DATABASE_URL` and `RAILWAY_REDIS_URL` in `.env.example` match those instructions.

4. Start the dev server:

   ```shell
   pnpm dev
   ```

   The app runs at http://localhost:3000.

## Deployment

The app is deployed on Vercel, with Postgres and Redis hosted on Railway. Production builds apply pending Prisma migrations before building. See [prisma/README.md](prisma/README.md#production-migrations).

## Commits

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org), enforced by a commit-msg hook and in CI.
