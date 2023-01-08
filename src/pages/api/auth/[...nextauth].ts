import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import NextAuth, { type NextAuthOptions } from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";

import { env } from "../../../env/server.mjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  events: {
    async createUser({ user }) {
      const id = user.id;
      const userSetting = await prisma.userSetting.findUnique({
        where: {
          userId: id,
        },
      });
      if (userSetting === null) {
        await prisma.userSetting.create({
          data: {
            userId: id,
            selectedUserId: id,
          },
        });
      }
    },
  },
  callbacks: {
    async session({ session, user }) {
      const userSetting = await prisma.userSetting.findUnique({
        where: {
          userId: user.id,
        },
      });
      if (session.user) {
        session.user.id = user.id;
        session.user.settings = userSetting;
      }
      return session;
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    Auth0Provider({
      clientId: env.AUTH0_CLIENT_ID,
      clientSecret: env.AUTH0_CLIENT_SECRET,
      issuer: env.AUTH0_ISSUER,
    }),
  ],
};

export default NextAuth(authOptions);
