import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { type GroomPost } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function PostHistory() {
  const { user } = useAuth();
  
  const { data: posts, isLoading } = useQuery<GroomPost[]>({
    queryKey: ['/api/user/posts'],
    enabled: !!user,
  });

  return (
    <main className="flex-grow bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <Link href="/">
            <Button
              variant="link"
              className="px-4 py-2 text-gray-500 font-medium"
            >
              Create Post
            </Button>
          </Link>
          <Button
            variant="link"
            className="px-4 py-2 border-b-2 border-primary text-primary font-medium"
          >
            Post History
          </Button>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Recent Posts</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-w-1 aspect-h-1">
                  <Skeleton className="w-full h-64" />
                </div>
                <div className="p-4">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-6">Start creating beautiful posts for your groomed dogs!</p>
            <Link href="/">
              <Button>Create Your First Post</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
