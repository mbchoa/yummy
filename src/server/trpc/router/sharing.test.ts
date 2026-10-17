import type { CollaboratorRole, CollaboratorStatus } from "@prisma/client";
import { afterEach, describe, expect, it } from "vitest";
import {
  callersFor,
  createUsers,
  deleteUsers,
  prisma,
} from "../../test/testDb";

const PREFIX = "test-sharing";
const RESTAURANT_ID = "test-restaurant";

afterEach(() => deleteUsers(PREFIX));

// an owner with one saved restaurant and a logged dish, a collaborator with
// the given role and invite status, and an outsider
const setUp = async (role: CollaboratorRole, status: CollaboratorStatus) => {
  const [ownerId, collaboratorId, outsiderId] = await createUsers(PREFIX, [
    "owner",
    "collaborator",
    "outsider",
  ]);
  await callersFor(ownerId).favoriteRestaurant.add({
    id: RESTAURANT_ID,
    like: "LIKE",
  });
  const dish = await callersFor(ownerId).foodReview.add({
    restaurantId: RESTAURANT_ID,
    name: "Morning Bun",
    like: "LIKE",
  });
  const share = await prisma.collaborator.create({
    data: { ownerId, collaboratorId, role, status },
  });
  return { ownerId, collaboratorId, outsiderId, dishId: dish.id, share };
};

// every change a list allows, made by `userId` while viewing `ownerId`'s list
const changes = (userId: string, ownerId: string, dishId: string) => {
  const callers = callersFor(userId, ownerId);
  return {
    "save a restaurant": () =>
      callers.favoriteRestaurant.add({ id: "another", like: "LIKE" }),
    "rate a restaurant": () =>
      callers.favoriteRestaurant.update({ id: RESTAURANT_ID, like: "DISLIKE" }),
    "remove a restaurant": () =>
      callers.favoriteRestaurant.remove({ id: RESTAURANT_ID }),
    "log a dish": () =>
      callers.foodReview.add({ restaurantId: RESTAURANT_ID, name: "Tart" }),
    "rate a dish": () =>
      callers.foodReview.update({ id: dishId, like: "DISLIKE" }),
    "remove a dish": () => callers.foodReview.remove({ id: dishId }),
  };
};

describe("an accepted editor", () => {
  it("can read the list", async () => {
    const { ownerId, collaboratorId } = await setUp("EDITOR", "ACCEPTED");
    const callers = callersFor(collaboratorId, ownerId);

    expect(await callers.favoriteRestaurant.all()).toHaveLength(1);
    expect(
      await callers.foodReview.all({ restaurantId: RESTAURANT_ID }),
    ).toHaveLength(1);
    expect(await callers.userSetting.access()).toEqual({
      ownerId,
      canEdit: true,
    });
  });

  it.each(Object.keys(changes("", "", "")))("can %s", async (change) => {
    const { ownerId, collaboratorId, dishId } = await setUp(
      "EDITOR",
      "ACCEPTED",
    );
    const makeChange = changes(collaboratorId, ownerId, dishId)[
      change as keyof ReturnType<typeof changes>
    ];

    await expect(makeChange()).resolves.toBeDefined();
  });
});

describe("an accepted viewer", () => {
  it("can read the list but not edit it", async () => {
    const { ownerId, collaboratorId } = await setUp("VIEWER", "ACCEPTED");
    const callers = callersFor(collaboratorId, ownerId);

    expect(await callers.favoriteRestaurant.all()).toHaveLength(1);
    expect(
      await callers.foodReview.all({ restaurantId: RESTAURANT_ID }),
    ).toHaveLength(1);
    expect(await callers.userSetting.access()).toEqual({
      ownerId,
      canEdit: false,
    });
  });

  it.each(Object.keys(changes("", "", "")))("can't %s", async (change) => {
    const { ownerId, collaboratorId, dishId } = await setUp(
      "VIEWER",
      "ACCEPTED",
    );
    const makeChange = changes(collaboratorId, ownerId, dishId)[
      change as keyof ReturnType<typeof changes>
    ];

    await expect(makeChange()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("a pending invite", () => {
  it("gives no access until it's accepted", async () => {
    const { ownerId, collaboratorId } = await setUp("EDITOR", "PENDING");
    const callers = callersFor(collaboratorId, ownerId);

    await expect(callers.favoriteRestaurant.all()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    await expect(
      callersFor(collaboratorId).userSetting.switchUser({ userId: ownerId }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(await callersFor(collaboratorId).collaborator.allOwner()).toEqual(
      [],
    );
  });

  it("shows up in the invitee's invites", async () => {
    const { ownerId, collaboratorId } = await setUp("VIEWER", "PENDING");

    const invites = await callersFor(collaboratorId).collaborator.invites();

    expect(invites).toMatchObject([
      { ownerId, role: "VIEWER", owner: { name: ownerId } },
    ]);
  });

  it("gives access once accepted", async () => {
    const { ownerId, collaboratorId } = await setUp("EDITOR", "PENDING");

    await callersFor(collaboratorId).collaborator.accept({ ownerId });

    expect(
      await callersFor(collaboratorId, ownerId).favoriteRestaurant.all(),
    ).toHaveLength(1);
    expect(await callersFor(collaboratorId).collaborator.invites()).toEqual([]);
  });

  it("is removed when declined", async () => {
    const { ownerId, collaboratorId } = await setUp("EDITOR", "PENDING");

    await callersFor(collaboratorId).collaborator.decline({ ownerId });

    expect(await callersFor(collaboratorId).collaborator.invites()).toEqual([]);
    expect(await callersFor(ownerId).collaborator.all()).toEqual([]);
  });

  it("is removed when the owner cancels it", async () => {
    const { ownerId, collaboratorId, share } = await setUp("EDITOR", "PENDING");

    await callersFor(ownerId).collaborator.remove({ id: share.id });

    expect(await callersFor(collaboratorId).collaborator.invites()).toEqual([]);
  });

  it("can't be accepted after it's been answered", async () => {
    const { ownerId, collaboratorId } = await setUp("EDITOR", "ACCEPTED");

    await expect(
      callersFor(collaboratorId).collaborator.accept({ ownerId }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("an outsider", () => {
  it("can't read or switch to the list", async () => {
    const { ownerId, outsiderId } = await setUp("EDITOR", "ACCEPTED");

    await expect(
      callersFor(outsiderId, ownerId).favoriteRestaurant.all(),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(
      callersFor(outsiderId, ownerId).foodReview.all({
        restaurantId: RESTAURANT_ID,
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(
      callersFor(outsiderId).userSetting.switchUser({ userId: ownerId }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("can't change a dish on the list", async () => {
    const { outsiderId, dishId } = await setUp("EDITOR", "ACCEPTED");

    await expect(
      callersFor(outsiderId).foodReview.remove({ id: dishId }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("can't change a collaborator's role", async () => {
    const { outsiderId, share } = await setUp("EDITOR", "ACCEPTED");

    await expect(
      callersFor(outsiderId).collaborator.setRole({
        id: share.id,
        role: "VIEWER",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("the owner", () => {
  it("invites as an editor by default, with the invite pending", async () => {
    const { ownerId, outsiderId } = await setUp("EDITOR", "ACCEPTED");

    const invite = await callersFor(ownerId).collaborator.add({
      collaboratorId: outsiderId,
    });

    expect(invite).toMatchObject({ role: "EDITOR", status: "PENDING" });
  });

  it("can't invite someone twice", async () => {
    const { ownerId, collaboratorId } = await setUp("EDITOR", "PENDING");

    await expect(
      callersFor(ownerId).collaborator.add({ collaboratorId }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("can't invite themselves", async () => {
    const { ownerId } = await setUp("EDITOR", "ACCEPTED");

    await expect(
      callersFor(ownerId).collaborator.add({ collaboratorId: ownerId }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("can make an editor a viewer", async () => {
    const { ownerId, collaboratorId, share } = await setUp(
      "EDITOR",
      "ACCEPTED",
    );

    await callersFor(ownerId).collaborator.setRole({
      id: share.id,
      role: "VIEWER",
    });

    await expect(
      callersFor(collaboratorId, ownerId).favoriteRestaurant.update({
        id: RESTAURANT_ID,
        like: "DISLIKE",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("removing someone switches them back to their own list", async () => {
    const { ownerId, collaboratorId, share } = await setUp(
      "EDITOR",
      "ACCEPTED",
    );
    await callersFor(collaboratorId).userSetting.switchUser({
      userId: ownerId,
    });

    await callersFor(ownerId).collaborator.remove({ id: share.id });

    const setting = await prisma.userSetting.findUniqueOrThrow({
      where: { userId: collaboratorId },
    });
    expect(setting.selectedUserId).toBe(collaboratorId);
  });
});
