import { useState } from "react";
import { Link, useLocation } from "wouter";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { ChevronDown, Menu, User, Flag } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events", hasDropdown: true },
    { name: "Create Events", href: "/create-event" },
    { name: "Community", href: "/community" }
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="text-2xl font-bold text-gray-900">
                  Lorg<span className="text-primary">X</span>
                </a>
              </Link>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              {navLinks.map((link) => 
                link.hasDropdown ? (
                  <DropdownMenu key={link.name}>
                    <DropdownMenuTrigger asChild>
                      <button className={`${
                        location === link.href 
                          ? "border-b-2 border-primary text-primary" 
                          : "text-gray-900 hover:text-primary"
                        } px-1 pt-1 font-medium flex items-center`}
                      >
                        {link.name}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href="/events"><a className="w-full">All Events</a></Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/events?filter=featured"><a className="w-full">Featured</a></Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/events?filter=nearby"><a className="w-full">Nearby</a></Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/events?filter=calendar"><a className="w-full">Calendar</a></Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link key={link.name} href={link.href}>
                    <a className={`${
                      location === link.href 
                        ? "border-b-2 border-primary text-primary" 
                        : "text-gray-900 hover:text-primary"
                      } px-1 pt-1 font-medium`}
                    >
                      {link.name}
                    </a>
                  </Link>
                )
              )}
            </div>
          </div>
          <div className="hidden sm:flex items-center">
            <SearchInput className="w-80 mr-4" />
            <div className="flex items-center space-x-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2 text-sm font-medium text-gray-900 focus:outline-none bg-gray-100 rounded-full px-3 py-1.5">
                      <div className="h-6 w-6 rounded-full flex items-center justify-center bg-white">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.fullName} className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <Flag className="h-4 w-4 text-gray-900" />
                        )}
                      </div>
                      <span className="hidden md:inline">{user.fullName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile"><a className="w-full">Profile</a></Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/events?filter=my-events"><a className="w-full">My Events</a></Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/chat"><a className="w-full">Messages</a></Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                  <Button variant="default">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center sm:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Mobile menu"
            >
              <Menu className="h-6 w-6 text-gray-900" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <a 
                className={`${
                  location === link.href 
                    ? "bg-primary text-white" 
                    : "text-gray-900 hover:bg-gray-50 hover:text-primary"
                  } block pl-3 pr-4 py-2 text-base font-medium`}
              >
                {link.name}
              </a>
            </Link>
          ))}
        </div>
        {user && (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-100">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.fullName} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-gray-900" />
                  )}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-900">{user.fullName}</div>
                <div className="text-sm font-medium text-gray-500">@{user.username}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link href="/profile">
                <a className="block px-4 py-2 text-base font-medium text-gray-900 hover:text-primary hover:bg-gray-50">
                  Profile
                </a>
              </Link>
              <Link href="/events?filter=my-events">
                <a className="block px-4 py-2 text-base font-medium text-gray-900 hover:text-primary hover:bg-gray-50">
                  My Events
                </a>
              </Link>
              <Link href="/chat">
                <a className="block px-4 py-2 text-base font-medium text-gray-900 hover:text-primary hover:bg-gray-50">
                  Messages
                </a>
              </Link>
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-900 hover:text-primary hover:bg-gray-50"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
