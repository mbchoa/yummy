import { useRouter } from "next/router";
import { DashboardLayout } from "../../components/dashboardLayout";
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

  return <DashboardLayout>Dashboard stuff</DashboardLayout>;
}
