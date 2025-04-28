import { Link } from "wouter";
import { PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Navbar() {
  const { toast } = useToast();

  const handleProfileClick = () => {
    toast({
      title: "Coming Soon",
      description: "User profiles will be available in a future update.",
    });
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex-shrink-0 flex items-center cursor-pointer">
                <PawPrint className="h-6 w-6 text-primary mr-2" />
                <span className="font-bold text-xl text-primary">Groom Posts</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full" 
              onClick={handleProfileClick}
            >
              <span className="sr-only">User profile</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-gray-500">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
