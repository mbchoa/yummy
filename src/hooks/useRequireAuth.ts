import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const useRequireAuth = () => {
  const { data: session, status } = useSession();

  const router = useRouter();

  // If auth.user is false that means we're not
  // logged in and should redirect.
  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if ((!session && typeof session != "undefined") || session?.user == null) {
      signIn("auth0");
      return;
    }
  }, [session, router, status]);

  return {
    session,
    loading: status === "loading",
  };
};
