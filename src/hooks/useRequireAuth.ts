import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const useRequireAuth = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  // If auth.user is false that means we're not
  // logged in and should redirect.
  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if ((!session && typeof session !== "undefined") || session?.user == null) {
      router.push("/");
    }
  }, [session, router, status]);

  return {
    session,
    loading: status === "loading",
  };
};
