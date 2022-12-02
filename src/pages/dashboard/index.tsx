import { useRouter } from "next/router";
import { Layout } from "../../components/layout";
import { LoggingIn } from "../../components/loggingIn";
import { useRequireAuth } from "../../hooks/useRequireAuth";

export default function Dashboard() {
  const router = useRouter();
  const { session, loading } = useRequireAuth();

  if (
    loading === true ||
    session === null ||
    session.user === null ||
    router.isReady === false
  ) {
    return <LoggingIn />;
  }

  return <Layout>Dashboard stuff</Layout>;
}
