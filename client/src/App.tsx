import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy, useEffect, useState } from "react";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { OfflineAuthProvider } from "./hooks/use-offline-auth";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

// Lazy load all page components to reduce initial bundle size
const NotFound = lazy(() => import("@/pages/not-found"));
const HomePage = lazy(() => import("@/pages/home-page"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const ProfilePage = lazy(() => import("@/pages/profile-page"));
const EventsPage = lazy(() => import("@/pages/events-page"));
const CreateEventPage = lazy(() => import("@/pages/create-event-page"));
const CommunityPage = lazy(() => import("@/pages/community-page"));
const ChatPage = lazy(() => import("@/pages/chat-page"));
const SearchPage = lazy(() => import("@/pages/search-page"));

// Network status indicator component
function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRefresh, setShowRefresh] = useState(false);
  
  useEffect(() => {
    function updateOnlineStatus() {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        // When coming back online, show refresh button briefly
        setShowRefresh(true);
        const timer = setTimeout(() => setShowRefresh(false), 5000);
        return () => clearTimeout(timer);
      }
    }
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);
  
  if (isOnline && !showRefresh) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOnline ? (
        <div className="bg-amber-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
          <WifiOff size={18} />
          <span>You're offline</span>
        </div>
      ) : showRefresh ? (
        <button 
          onClick={() => window.location.reload()}
          className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg hover:bg-green-600 transition-colors"
        >
          <RefreshCw size={18} />
          <span>Back online! Refresh?</span>
        </button>
      ) : null}
    </div>
  );
}

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
      <ProtectedRoute path="/search" component={SearchPage} />
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

// Import the loading component
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// PWA installation prompt
function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setShowInstallButton(true);
    });
    
    window.addEventListener('appinstalled', () => {
      // Log app installed
      console.log('PWA was installed');
      setShowInstallButton(false);
    });
  }, []);
  
  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
      setShowInstallButton(false);
    });
  };
  
  if (!showInstallButton) return null;
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button 
        onClick={handleInstallClick}
        className="bg-primary text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg hover:bg-primary/90 transition-colors"
      >
        <span>Install LorgX App</span>
      </button>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OfflineAuthProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Router />
            <NetworkStatus />
            <InstallPWA />
          </Suspense>
          <Toaster />
        </OfflineAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
