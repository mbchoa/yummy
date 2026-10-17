import { PrismaClient } from "@prisma/client";
import { collaborator } from "../trpc/router/collaborator";
import { favoriteRestaurant } from "../trpc/router/favoriteRestaurant";
import { foodReview } from "../trpc/router/foodReview";
import { userSetting } from "../trpc/router/userSetting";

// server tests write to a real database, so they only run against one meant
// for tests, never the one in .env
const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (testDatabaseUrl === undefined) {
  throw new Error(
    "Set TEST_DATABASE_URL to a migrated test database to run the server tests",
  );
}

export const prisma = new PrismaClient({
  datasources: { db: { url: testDatabaseUrl } },
});

// creates users (with the settings row sign-up creates) named after `prefix`,
// so each test file only touches its own rows; returns their IDs in order
export const createUsers = async <Names extends string[]>(
  prefix: string,
  names: [...Names],
) => {
  const ids = names.map((name) => `${prefix}-${name}`);
  for (const id of ids) {
    await prisma.user.create({
      data: { id, name: id, email: `${id}@test.local` },
    });
    await prisma.userSetting.create({
      data: { userId: id, selectedUserId: id },
    });
  }
  return ids as { [Index in keyof Names]: string };
};

export const deleteUsers = async (prefix: string) => {
  // settings don't cascade when their user is deleted
  await prisma.userSetting.deleteMany({
    where: { userId: { startsWith: `${prefix}-` } },
  });
  await prisma.user.deleteMany({ where: { id: { startsWith: `${prefix}-` } } });
};

// tRPC callers acting as `userId`, viewing `selectedUserId`'s list
export const callersFor = (userId: string, selectedUserId = userId) => {
  const ctx = {
    prisma,
    session: {
      expires: "",
      user: { id: userId, settings: { id: "", userId, selectedUserId } },
    },
  };
  return {
    collaborator: collaborator.createCaller(ctx),
    favoriteRestaurant: favoriteRestaurant.createCaller(ctx),
    foodReview: foodReview.createCaller(ctx),
    userSetting: userSetting.createCaller(ctx),
  };
};
