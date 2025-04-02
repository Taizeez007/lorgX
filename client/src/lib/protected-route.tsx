import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { ComponentType, LazyExoticComponent } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type ComponentProp = LazyExoticComponent<ComponentType<any>> | (() => React.JSX.Element);

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: ComponentProp;
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {isLoading ? (
        <LoadingSpinner />
      ) : user ? (
        <Component />
      ) : (
        <Redirect to="/auth" />
      )}
    </Route>
  );
}
