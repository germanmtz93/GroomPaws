import { useState } from "react";
import { Link } from "wouter";
import PhotoUpload from "@/components/photo-upload";
import PostForm from "@/components/post-form";
import PostPreview from "@/components/post-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type InsertGroomPost } from "@shared/schema";

export default function Home() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [dogName, setDogName] = useState<string>("");
  const [groomingService, setGroomingService] = useState<string>("full-groom");
  const [notes, setNotes] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [beforeImageUrl, setBeforeImageUrl] = useState<string>("");
  const [afterImageUrl, setAfterImageUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPostingToInstagram, setIsPostingToInstagram] = useState<boolean>(false);

  // Caption generation mutation
  const generateCaptionMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      try {
        const response = await apiRequest('POST', '/api/generate-caption', {
          dogName,
          groomingService,
          notes,
          tags
        });
        
        const data = await response.json();
        return data.caption;
      } finally {
        setIsGenerating(false);
      }
    },
    onSuccess: (data) => {
      setCaption(data);
      toast({
        title: "Caption generated!",
        description: "Your Instagram caption has been created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error generating caption",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Save post mutation
  const savePostMutation = useMutation({
    mutationFn: async (status: string) => {
      const postData: InsertGroomPost = {
        dogName,
        groomingService,
        notes,
        tags,
        beforeImageUrl,
        afterImageUrl,
        caption,
        status
      };
      
      const response = await apiRequest('POST', '/api/posts', postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Success!",
        description: "Your post has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving post",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerateCaption = () => {
    if (!dogName) {
      toast({
        title: "Missing information",
        description: "Please enter the dog's name.",
        variant: "destructive",
      });
      return;
    }
    
    generateCaptionMutation.mutate();
  };

  const handleSaveDraft = () => {
    if (!validateForm()) return;
    savePostMutation.mutate('draft');
  };

  // Post directly to Instagram mutation
  const postToInstagramMutation = useMutation({
    mutationFn: async (postId: number) => {
      setIsPostingToInstagram(true);
      try {
        const response = await apiRequest('POST', `/api/posts/${postId}/instagram`);
        return response.json();
      } finally {
        setIsPostingToInstagram(false);
      }
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
      
      // Clear the form after successful posting
      clearForm();
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

  const handlePostToInstagram = () => {
    if (!validateForm()) return;
    
    // First save the post, then post to Instagram
    savePostMutation.mutate('draft', {
      onSuccess: (data) => {
        // After saving, post to Instagram with the post ID
        if (data && data.id) {
          postToInstagramMutation.mutate(data.id);
        }
      }
    });
  };

  const validateForm = () => {
    if (!dogName || !beforeImageUrl || !afterImageUrl || !caption) {
      toast({
        title: "Missing information",
        description: "Please complete all required fields and generate a caption.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handlePhotosUploaded = (before: string, after: string) => {
    setBeforeImageUrl(before);
    setAfterImageUrl(after);
  };

  const clearForm = () => {
    setDogName("");
    setGroomingService("full-groom");
    setNotes("");
    setTags("");
    setCaption("");
    setBeforeImageUrl("");
    setAfterImageUrl("");
  };

  return (
    <main className="flex-grow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <Button
            variant="link"
            className={`px-4 py-2 ${
              activeTab === 'create' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-500 font-medium'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Create Post
          </Button>
          <Link href="/history">
            <Button
              variant="link"
              className="px-4 py-2 text-gray-500 font-medium"
            >
              Post History
            </Button>
          </Link>
        </div>

        {/* Main content grid */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Post Creation Form */}
          <div className="mb-8 lg:mb-0">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Create a New Post</h2>
                
                <PhotoUpload 
                  onPhotosUploaded={handlePhotosUploaded} 
                  beforeImageUrl={beforeImageUrl}
                  afterImageUrl={afterImageUrl}
                  isUploading={isUploading}
                  setIsUploading={setIsUploading}
                />
                
                <PostForm
                  dogName={dogName}
                  setDogName={setDogName}
                  groomingService={groomingService}
                  setGroomingService={setGroomingService}
                  notes={notes}
                  setNotes={setNotes}
                  tags={tags}
                  setTags={setTags}
                  onGeneratePost={handleGenerateCaption}
                  isGenerating={isGenerating}
                  disabled={isUploading}
                />
              </CardContent>
            </Card>
          </div>

          {/* Post Preview */}
          <PostPreview
            dogName={dogName}
            salonName="Fluffy Friends Grooming"
            beforeImageUrl={beforeImageUrl}
            afterImageUrl={afterImageUrl}
            caption={caption}
            tags={tags}
            onSaveDraft={handleSaveDraft}
            onPostToInstagram={handlePostToInstagram}
            isSaving={savePostMutation.isPending}
            isPostingToInstagram={isPostingToInstagram}
          />
        </div>
      </div>
    </main>
  );
}
