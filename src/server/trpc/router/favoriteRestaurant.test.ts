import { afterEach, describe, expect, it } from "vitest";
import {
  callersFor,
  createUsers,
  deleteUsers,
  prisma,
} from "../../test/testDb";

const PREFIX = "test-favorite-restaurant";
const RESTAURANT_ID = "test-restaurant";

afterEach(() => deleteUsers(PREFIX));

describe("favoriteRestaurant", () => {
  it("saves a restaurant to try, listed on its own", async () => {
    const [ownerId] = await createUsers(PREFIX, ["owner"]);
    const callers = callersFor(ownerId);

    await callers.favoriteRestaurant.add({
      id: RESTAURANT_ID,
      like: "WANT_TO_TRY",
    });

    expect(
      await callers.favoriteRestaurant.all({ like: "WANT_TO_TRY" }),
    ).toMatchObject([{ restaurantId: RESTAURANT_ID }]);
    expect(await callers.favoriteRestaurant.all({ like: "LIKE" })).toEqual([]);
  });

  it("keeps dishes and the note when the restaurant changes state", async () => {
    const [ownerId] = await createUsers(PREFIX, ["owner"]);
    const callers = callersFor(ownerId);
    await callers.favoriteRestaurant.add({
      id: RESTAURANT_ID,
      like: "WANT_TO_TRY",
    });
    await callers.favoriteRestaurant.setNote({
      id: RESTAURANT_ID,
      note: "Sam recommended it",
    });
    await callers.foodReview.add({
      restaurantId: RESTAURANT_ID,
      name: "Khao Soi",
    });

    await callers.favoriteRestaurant.add({ id: RESTAURANT_ID, like: "LIKE" });

    expect(
      await callers.favoriteRestaurant.byId({ id: RESTAURANT_ID }),
    ).toMatchObject({ like: "LIKE", note: "Sam recommended it" });
    expect(
      await callers.foodReview.all({ restaurantId: RESTAURANT_ID }),
    ).toHaveLength(1);
  });

  it("hides a removed restaurant, and saving it again restores its dishes and note", async () => {
    const [ownerId] = await createUsers(PREFIX, ["owner"]);
    const callers = callersFor(ownerId);
    await callers.favoriteRestaurant.add({ id: RESTAURANT_ID, like: "LIKE" });
    await callers.favoriteRestaurant.setNote({
      id: RESTAURANT_ID,
      note: "Ask for the patio",
    });
    await callers.foodReview.add({
      restaurantId: RESTAURANT_ID,
      name: "Morning Bun",
    });

    await callers.favoriteRestaurant.remove({ id: RESTAURANT_ID });

    expect(await callers.favoriteRestaurant.all()).toEqual([]);
    expect(
      await callers.favoriteRestaurant.byId({ id: RESTAURANT_ID }),
    ).toBeNull();
    expect(
      await callers.favoriteRestaurant.statuses({ ids: [RESTAURANT_ID] }),
    ).toEqual([]);

    await callers.favoriteRestaurant.add({
      id: RESTAURANT_ID,
      like: "DISLIKE",
    });

    expect(
      await callers.favoriteRestaurant.byId({ id: RESTAURANT_ID }),
    ).toMatchObject({ like: "DISLIKE", note: "Ask for the patio" });
    expect(
      await callers.foodReview.all({ restaurantId: RESTAURANT_ID }),
    ).toHaveLength(1);
  });

  it("won't log a dish at a restaurant that isn't saved or was removed", async () => {
    const [ownerId] = await createUsers(PREFIX, ["owner"]);
    const callers = callersFor(ownerId);

    await expect(
      callers.foodReview.add({ restaurantId: RESTAURANT_ID, name: "Tart" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    await callers.favoriteRestaurant.add({ id: RESTAURANT_ID, like: "LIKE" });
    await callers.favoriteRestaurant.remove({ id: RESTAURANT_ID });

    await expect(
      callers.foodReview.add({ restaurantId: RESTAURANT_ID, name: "Tart" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("stores a blank note as no note", async () => {
    const [ownerId] = await createUsers(PREFIX, ["owner"]);
    const callers = callersFor(ownerId);
    await callers.favoriteRestaurant.add({ id: RESTAURANT_ID, like: "LIKE" });
    await callers.favoriteRestaurant.setNote({
      id: RESTAURANT_ID,
      note: "Closed Mondays",
    });

    await callers.favoriteRestaurant.setNote({ id: RESTAURANT_ID, note: "  " });

    expect(
      await callers.favoriteRestaurant.byId({ id: RESTAURANT_ID }),
    ).toMatchObject({ note: null });
  });

  it("only lets editors write the note", async () => {
    const [ownerId, viewerId] = await createUsers(PREFIX, ["owner", "viewer"]);
    await prisma.collaborator.create({
      data: {
        ownerId,
        collaboratorId: viewerId,
        role: "VIEWER",
        status: "ACCEPTED",
      },
    });
    await callersFor(ownerId).favoriteRestaurant.add({
      id: RESTAURANT_ID,
      like: "LIKE",
    });

    await expect(
      callersFor(viewerId, ownerId).favoriteRestaurant.setNote({
        id: RESTAURANT_ID,
        note: "Nope",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("can't add a note to a restaurant that isn't saved", async () => {
    const [ownerId] = await createUsers(PREFIX, ["owner"]);

    await expect(
      callersFor(ownerId).favoriteRestaurant.setNote({
        id: RESTAURANT_ID,
        note: "Hello",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("reports how each restaurant is saved", async () => {
    const [ownerId] = await createUsers(PREFIX, ["owner"]);
    const callers = callersFor(ownerId);
    await callers.favoriteRestaurant.add({ id: "liked", like: "LIKE" });
    await callers.favoriteRestaurant.add({ id: "to-try", like: "WANT_TO_TRY" });

    const statuses = await callers.favoriteRestaurant.statuses({
      ids: ["liked", "to-try", "unsaved"],
    });

    expect(
      statuses.map((status) => [status.restaurantId, status.like]).sort(),
    ).toEqual([
      ["liked", "LIKE"],
      ["to-try", "WANT_TO_TRY"],
    ]);
  });
});
