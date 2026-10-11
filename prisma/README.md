# Local DB

If you aren't changing the data model or doing a data migration, you probably don't need to worry about using this.
If you are making a change that might break the dev environment, this is a good testing ground.

## Mac Docker Setup

Setup colima and docker
`brew install colima docker`

Start Colima
`colima start`

You can now run any docker commands you need.

### Notes for Colima

You can start/stop the Colima environments to retain pulled and built images. If you run `colima delete` it will wipe the environment, which may be useful in some cases.

## Run Postgres Locally

### Build

This will build the docker image in your local colima environment. Needs to be run in this directory.

```shell
docker build -t yumshin_db .
```

### Run

This will start the latest version of the above container locally.

```
docker run --name yumshin_db -p 5455:5432 -d yumshin_db:latest
```

### Apply Migrations

Set this inside your .env file

```dotenv
DATABASE_URL=postgresql://yumshin:yumshin@localhost:5455/yumshin
```

From the root of the project run `pnpm db:deploy` to apply the migrations to your local DB.

### Using Existing DB Data

In some cases it may be easiest to copy some existing data to test with. In those
cases it can be helpful to use an export from one of our DB instances in Railway.
In this case, we'll be using the dev instance.

- Dump the DB from DBeaver
- Navigate to the download directory
- Run `psql -h localhost -d yumshin -U yumshin -p 5455 -f <export_file_name_here>`
- Enter the password "yumshin" when prompted

This should result in all tables being created and data being populated as they existed at the time of export.

## Run Redis Locally

The Yelp router caches API responses in Redis. Start a local instance:

```shell
docker run --name yumshin_redis -p 6379:6379 -d redis:7
```

Set this inside your .env file

```dotenv
RAILWAY_REDIS_URL=redis://localhost:6379
```

## Production Migrations

Migrations are applied automatically on production deploys. When Vercel builds with
`VERCEL_ENV=production`, the `build` script runs `prisma migrate deploy` against the
production database before `next build`. If a migration fails, the build fails and the
current deployment keeps serving traffic. Preview and local builds skip this step.

Because the migration runs before the new code goes live, migrations must be compatible
with the previously deployed code.

## Repairing Misattached Dish Reviews (#115)

Before #90, `RestaurantItem.name` was globally unique, so adding a dish whose name already
existed anywhere attached the new review to that existing item, sometimes in another
user's list. The scripts in [scripts/repair-misattached-reviews](scripts/repair-misattached-reviews)
find and repair those reviews. They're plain SQL run with `psql`, and they require migration
`20261009000000_scope_restaurant_item_name_unique` to be applied first.

A review is misattached when its `reviewedById` differs from its item's `userId`. Each one is
classified (see the header of `classify.sql` for the full rules):

- **repairable**: the reviewer has their own favorite at the item's restaurant, created
  before the review. The review moves to the reviewer's item with the same name at that
  restaurant, which is created if missing.
- **ambiguous**: the reviewer has no favorite there, the favorite was added after the
  review, or the reviewer's account was deleted. These are reported and left untouched for
  a manual decision.

Run them in this order, from the project root:

1. Report (read-only):

   ```shell
   psql "$DATABASE_URL" -f prisma/scripts/repair-misattached-reviews/report.sql
   ```

2. Dry run. `repair.sql` ends with `ROLLBACK`, so it shows the planned moves and the row
   counts before and after, then undoes everything:

   ```shell
   psql "$DATABASE_URL" -f prisma/scripts/repair-misattached-reviews/repair.sql
   ```

3. Commit. Change the final `ROLLBACK;` in `repair.sql` to `COMMIT;` (or a local copy kept
   next to `classify.sql`) and run it again. The script aborts and rolls back if any
   planned review didn't move or any review or favorite count changed. It never deletes
   rows, and running it again is a no-op.

**Limitation:** a review attached to the right user's item at the wrong restaurant (both
restaurants in the same list) looks correct in the data and can't be detected.

To test the scripts locally, migrate a throwaway database up to but not including
`20261009000000`, apply `fixtures/seed-prefix.sql`, then that migration, then
`fixtures/seed-postfix.sql`, and run the steps above against it.
