import { type GetServerSideProps } from "next";
import { type Session } from "next-auth";

import { getServerAuthSession } from "./get-server-auth-session";

/**
 * getServerSideProps for pages that need a signed-in user: redirects to the
 * landing page before anything renders, and hands the session to
 * SessionProvider so the page doesn't start in a loading state.
 */
export const requireAuth: GetServerSideProps<{ session: Session }> = async (
  ctx,
) => {
  const session = await getServerAuthSession(ctx);
  if (!session?.user) {
    return { redirect: { destination: "/", permanent: false } };
  }

  // page props must be serializable; this drops any undefined fields
  return { props: { session: JSON.parse(JSON.stringify(session)) } };
};
