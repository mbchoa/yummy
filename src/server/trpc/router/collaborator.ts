import {
  CollaboratorRole,
  CollaboratorStatus,
  type PrismaClient,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

const roleSchema = z.enum([CollaboratorRole.VIEWER, CollaboratorRole.EDITOR]);

export const collaborator = router({
  // lists shared with you that you've accepted
  allOwner: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.collaborator.findMany({
      where: {
        collaboratorId: ctx.session.user.id,
        status: CollaboratorStatus.ACCEPTED,
      },
      include: {
        owner: true,
        collaborator: true,
      },
    });
  }),
  // people you've shared your list with, including pending invites
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.collaborator.findMany({
      where: {
        ownerId: ctx.session.user.id,
      },
      include: {
        collaborator: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }),
  // invites to other people's lists waiting for your answer
  invites: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.collaborator.findMany({
      where: {
        collaboratorId: ctx.session.user.id,
        status: CollaboratorStatus.PENDING,
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }),
  // invites someone to your list; they get access once they accept
  add: protectedProcedure
    .input(
      z.object({
        collaboratorId: z.string(),
        role: roleSchema.optional().default(CollaboratorRole.EDITOR),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.collaboratorId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't add yourself as a collaborator",
        });
      }

      const existing = await ctx.prisma.collaborator.findUnique({
        where: {
          collaboratorId_ownerId: {
            collaboratorId: input.collaboratorId,
            ownerId: ctx.session.user.id,
          },
        },
      });

      if (existing !== null) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            existing.status === CollaboratorStatus.PENDING
              ? "They already have an invite to your list"
              : "They already have access to your list",
        });
      }

      return ctx.prisma.collaborator.create({
        data: {
          ownerId: ctx.session.user.id,
          collaboratorId: input.collaboratorId,
          role: input.role,
        },
      });
    }),
  accept: protectedProcedure
    .input(
      z.object({
        ownerId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const invite = await findInvite(
        ctx.prisma,
        ctx.session.user.id,
        input.ownerId,
      );

      return ctx.prisma.collaborator.update({
        where: {
          id: invite.id,
        },
        data: {
          status: CollaboratorStatus.ACCEPTED,
        },
      });
    }),
  decline: protectedProcedure
    .input(
      z.object({
        ownerId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const invite = await findInvite(
        ctx.prisma,
        ctx.session.user.id,
        input.ownerId,
      );

      await ctx.prisma.collaborator.delete({
        where: {
          id: invite.id,
        },
      });
    }),
  // changes what someone you've shared your list with can do
  setRole: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        role: roleSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { count } = await ctx.prisma.collaborator.updateMany({
        where: {
          id: input.id,
          ownerId: ctx.session.user.id,
        },
        data: {
          role: input.role,
        },
      });

      if (count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collaborator not found",
        });
      }
    }),
  // removes someone from your list, or cancels their invite
  remove: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const collaborator = await ctx.prisma.collaborator.findFirst({
        where: {
          id: input.id,
          ownerId: ctx.session.user.id,
        },
      });

      if (collaborator === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collaborator not found",
        });
      }

      await revokeAccess(
        ctx.prisma,
        collaborator.collaboratorId,
        collaborator.ownerId,
      );
    }),
  // stop collaborating on a list someone else shared with you
  leave: protectedProcedure
    .input(
      z.object({
        ownerId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const collaborator = await ctx.prisma.collaborator.findUnique({
        where: {
          collaboratorId_ownerId: {
            collaboratorId: ctx.session.user.id,
            ownerId: input.ownerId,
          },
        },
      });

      if (collaborator === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Shared list not found",
        });
      }

      await revokeAccess(ctx.prisma, ctx.session.user.id, input.ownerId);
    }),
});

const findInvite = async (
  prisma: PrismaClient,
  collaboratorId: string,
  ownerId: string,
) => {
  const invite = await prisma.collaborator.findUnique({
    where: {
      collaboratorId_ownerId: { collaboratorId, ownerId },
    },
  });

  if (invite === null || invite.status !== CollaboratorStatus.PENDING) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Invite not found",
    });
  }

  return invite;
};

// removes the collaborator's access, and if they were viewing that list,
// switches them back to their own so they don't land on a list they can't load
const revokeAccess = (
  prisma: PrismaClient,
  collaboratorId: string,
  ownerId: string,
) =>
  prisma.$transaction([
    prisma.collaborator.delete({
      where: {
        collaboratorId_ownerId: { collaboratorId, ownerId },
      },
    }),
    prisma.userSetting.updateMany({
      where: { userId: collaboratorId, selectedUserId: ownerId },
      data: { selectedUserId: collaboratorId },
    }),
  ]);
