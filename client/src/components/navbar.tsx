import { Link, useLocation } from "wouter";
import { PawPrint, History, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();

  const handleProfileClick = () => {
    toast({
      title: "Coming Soon",
      description: "User profile settings will be available in a future update.",
    });
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
        setLocation("/auth");
      },
    });
  };

  const handleLogin = () => {
    setLocation("/auth");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex-shrink-0 flex items-center cursor-pointer">
                <PawPrint className="h-6 w-6 text-primary mr-2" />
                <span className="font-bold text-xl text-primary">Groom Posts</span>
              </div>
            </Link>
            
            {user && (
              <div className="hidden md:flex space-x-4">
                <Link href="/">
                  <Button variant="ghost" className={location === '/' ? 'bg-muted' : ''}>
                    New Post
                  </Button>
                </Link>
                <Link href="/history">
                  <Button variant="ghost" className={location === '/history' ? 'bg-muted' : ''}>
                    <History className="h-4 w-4 mr-2" />
                    History
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <span className="sr-only">User menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.fullName || "User"}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfileClick}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleLogin} variant="default">
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
