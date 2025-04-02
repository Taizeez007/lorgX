import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { Loader2 } from "lucide-react";

// Lazy load all page components to reduce initial bundle size
const NotFound = lazy(() => import("@/pages/not-found"));
const HomePage = lazy(() => import("@/pages/home-page"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const ProfilePage = lazy(() => import("@/pages/profile-page"));
const EventsPage = lazy(() => import("@/pages/events-page"));
const CreateEventPage = lazy(() => import("@/pages/create-event-page"));
const CommunityPage = lazy(() => import("@/pages/community-page"));
const ChatPage = lazy(() => import("@/pages/chat-page"));

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <Route path="/auth">
        <AuthPage />
      </Route>
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/events" component={EventsPage} />
      <ProtectedRoute path="/create-event" component={CreateEventPage} />
      <ProtectedRoute path="/community" component={CommunityPage} />
      <ProtectedRoute path="/chat" component={ChatPage} />
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

// Import the loading component
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Router />
        </Suspense>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
