import {
  CollaboratorRole,
  CollaboratorStatus,
  type PrismaClient,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type { Session } from "next-auth";

type SessionUser = NonNullable<Session["user"]>;

export interface IListAccess {
  ownerId: string;
  // owners and editors can change the list; viewers can only see it
  canEdit: boolean;
}

// access to ownerId's list: your own, or one shared with you whose invite
// you've accepted
export const getAccessToList = async (
  prisma: PrismaClient,
  userId: string,
  ownerId: string,
): Promise<IListAccess> => {
  if (ownerId === userId) {
    return { ownerId, canEdit: true };
  }

  const collaborator = await prisma.collaborator.findUnique({
    where: {
      collaboratorId_ownerId: {
        collaboratorId: userId,
        ownerId,
      },
    },
  });

  if (
    collaborator === null ||
    collaborator.status !== CollaboratorStatus.ACCEPTED
  ) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User does not have access to selected user's favorites list",
    });
  }

  return { ownerId, canEdit: collaborator.role === CollaboratorRole.EDITOR };
};

// access to the list the user is viewing
export const getListAccess = (prisma: PrismaClient, user: SessionUser) => {
  if (user.settings === null) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "User settings not found",
    });
  }

  return getAccessToList(prisma, user.id, user.settings.selectedUserId);
};

export const assertCanEdit = (access: IListAccess) => {
  if (!access.canEdit) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You can view this list but not change it",
    });
  }
};

// the owner of the list the user is viewing, for changes to it
export const getEditableListOwnerId = async (
  prisma: PrismaClient,
  user: SessionUser,
) => {
  const access = await getListAccess(prisma, user);
  assertCanEdit(access);
  return access.ownerId;
};
