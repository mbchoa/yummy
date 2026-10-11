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
