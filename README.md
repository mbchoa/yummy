# yummy

A personal restaurant and dish journal. Search restaurants through the Yelp Fusion API, save the ones you like or dislike, and keep a list of the dishes you've tried at each one with a thumbs up or down. You can invite collaborators to your list, as editors who can add to and change it or viewers who can only see it. Access starts once they accept the invite.

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

## Tests

The server tests call the tRPC routers against a real Postgres database. They only run against the database in `TEST_DATABASE_URL`, never the one in `.env`, and they delete the rows they create.

1. Create a test database next to your dev database and apply the migrations to it:

   ```shell
   createdb -h localhost -U <user> yummy_test
   DATABASE_URL="postgresql://<user>:<password>@localhost:<port>/yummy_test" pnpm prisma migrate deploy
   ```

2. Run the tests:

   ```shell
   TEST_DATABASE_URL="postgresql://<user>:<password>@localhost:<port>/yummy_test" pnpm test
   ```

CI runs the type check, lint and tests on every pull request (`.github/workflows/ci.yaml`).

## Deployment

The app is deployed on Vercel, with Postgres and Redis hosted on Railway. Production builds apply pending Prisma migrations before building. See [prisma/README.md](prisma/README.md#production-migrations).

## Commits

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org), enforced by a commit-msg hook and in CI.
