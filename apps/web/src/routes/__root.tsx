import { createRootRouteWithContext, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import api from "@/lib/axios";

interface RouterContext {
  queryClient: QueryClient;
}

const publicRoutes = ["/login"];

function RootComponent() {
  const { data: session, isPending: authPending } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: profile, isPending: profilePending } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("/api/profile").then((r) => r.data),
    enabled: !!session,
  });

  useEffect(() => {
    if (authPending) return;
    if (session && profilePending) return;

    const isPublic = publicRoutes.includes(location.pathname);

    if (!session && !isPublic) {
      navigate({ to: "/login" });
      return;
    }

    if (session && profile && !profile.age && location.pathname !== "/onboarding") {
      navigate({ to: "/onboarding" });
      return;
    }
  }, [session, authPending, profile, profilePending, location.pathname, navigate]);

  if (authPending) return null;
  if (session && profilePending) return null;

  return <Outlet />;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
