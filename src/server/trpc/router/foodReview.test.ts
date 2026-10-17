import { afterEach, describe, expect, it } from "vitest";
import {
  callersFor,
  createUsers,
  deleteUsers,
  prisma,
} from "../../test/testDb";

const PREFIX = "test-food-review";
const RESTAURANT_ID = "test-restaurant";

afterEach(() => deleteUsers(PREFIX));

const setUp = async () => {
  const [ownerId, editorId] = await createUsers(PREFIX, ["owner", "editor"]);
  await prisma.collaborator.create({
    data: {
      ownerId,
      collaboratorId: editorId,
      role: "EDITOR",
      status: "ACCEPTED",
    },
  });
  await callersFor(ownerId).favoriteRestaurant.add({
    id: RESTAURANT_ID,
    like: "LIKE",
  });
  return { ownerId, editorId };
};

describe("foodReview", () => {
  it("credits a dish to whoever logged it, and lists everyone's dishes", async () => {
    const { ownerId, editorId } = await setUp();
    await callersFor(ownerId).foodReview.add({
      restaurantId: RESTAURANT_ID,
      name: "Morning Bun",
    });
    await callersFor(editorId, ownerId).foodReview.add({
      restaurantId: RESTAURANT_ID,
      name: "Tart",
    });

    const dishes = await callersFor(ownerId).foodReview.all({
      restaurantId: RESTAURANT_ID,
    });

    expect(
      dishes
        .map((dish) => [dish.restaurantItem.name, dish.reviewedBy?.id])
        .sort(),
    ).toEqual([
      ["Morning Bun", ownerId],
      ["Tart", editorId],
    ]);
  });

  it("rejects a dish already logged, whatever its capitalization", async () => {
    const { ownerId } = await setUp();
    await callersFor(ownerId).foodReview.add({
      restaurantId: RESTAURANT_ID,
      name: "Morning Bun",
    });

    await expect(
      callersFor(ownerId).foodReview.add({
        restaurantId: RESTAURANT_ID,
        name: "morning bun",
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("keeps a collaborator's own list separate from the shared one", async () => {
    const { ownerId, editorId } = await setUp();
    await callersFor(editorId, ownerId).foodReview.add({
      restaurantId: RESTAURANT_ID,
      name: "Tart",
    });

    expect(
      await callersFor(editorId).foodReview.all({
        restaurantId: RESTAURANT_ID,
      }),
    ).toEqual([]);
  });
});
