import { createRootRouteWithContext, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth";
import { useEffect } from "react";

interface RouterContext {
  queryClient: QueryClient;
}

const publicRoutes = ["/login"];

function RootComponent() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isPending) return;

    const isPublic = publicRoutes.includes(location.pathname);

    if (!session && !isPublic) {
      navigate({ to: "/login" });
    }
  }, [session, isPending, location.pathname, navigate]);

  if (isPending) return null;

  return <Outlet />;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
