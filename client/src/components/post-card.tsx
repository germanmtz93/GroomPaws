import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { type GroomPost } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PostCardProps {
  post: GroomPost;
}

export default function PostCard({ post }: PostCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/posts/${post.id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate();
    }
  };

  const handleEdit = () => {
    toast({
      title: "Coming Soon",
      description: "Editing functionality will be available in a future update.",
    });
  };

  const instagramShareMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/posts/${post.id}/instagram`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      
      if (data.instagramPermalink) {
        toast({
          title: "Posted to Instagram!",
          description: (
            <div>
              Your post is now live on Instagram.{" "}
              <a 
                href={data.instagramPermalink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline text-primary"
              >
                View on Instagram
              </a>
            </div>
          ),
        });
      } else {
        toast({
          title: "Posted to Instagram!",
          description: "Your post has been published to Instagram successfully.",
        });
      }
    },
    onError: (error: any) => {
      if (error.message && error.message.includes('Instagram integration not configured')) {
        toast({
          title: "Instagram credentials needed",
          description: "Please provide your Instagram API credentials in the environment settings.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to post to Instagram. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const handleInstagramShare = () => {
    if (post.instagramPostId) {
      // If already posted, show the permalink
      if (post.instagramPermalink) {
        window.open(post.instagramPermalink, '_blank');
      } else {
        toast({
          title: "Already posted",
          description: "This post has already been published to Instagram.",
        });
      }
    } else {
      // Confirm before posting
      if (window.confirm("Are you sure you want to post this to Instagram?")) {
        instagramShareMutation.mutate();
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="aspect-w-1 aspect-h-1 relative">
        <div className="grid grid-cols-2 h-full">
          <img 
            src={post.beforeImageUrl} 
            alt={`${post.dogName} before grooming`} 
            className="object-cover w-full h-full"
          />
          <img 
            src={post.afterImageUrl} 
            alt={`${post.dogName} after grooming`} 
            className="object-cover w-full h-full"
          />
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">{post.dogName}</h3>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.caption}</p>
        <div className="flex justify-between">
          <span className="text-xs text-primary">{post.tags}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-500 hover:text-gray-700">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>Edit Post</DropdownMenuItem>
              <DropdownMenuItem onClick={handleInstagramShare}>Share to Instagram</DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-500" 
                onClick={handleDelete}
              >
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
