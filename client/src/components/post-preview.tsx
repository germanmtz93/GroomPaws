import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Instagram } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PostPreviewProps {
  dogName: string;
  salonName: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  caption: string;
  tags: string;
  onSaveDraft: () => void;
  onPostToInstagram: () => void;
  isSaving: boolean;
}

export default function PostPreview({
  dogName,
  salonName,
  beforeImageUrl,
  afterImageUrl,
  caption,
  tags,
  onSaveDraft,
  onPostToInstagram,
  isSaving
}: PostPreviewProps) {
  const displayCaption = caption || (
    dogName ? 
      `${dogName} looks amazing after their grooming session!` : 
      "Your dog will look amazing after grooming!"
  );
  
  const combinedCaption = displayCaption + (tags ? `\n\n${tags}` : "");
  
  return (
    <div>
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Post Preview</h2>
          
          {/* Instagram-style Post Preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Post Header */}
            <div className="p-3 flex items-center border-b border-gray-200">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="10" r="3" />
                  <path d="M18 19v-4" />
                  <path d="M18 8v-3" />
                  <path d="M6 12v-3" />
                  <path d="M6 19v-4" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-semibold text-sm">{salonName}</p>
                <p className="text-xs text-gray-500">Sponsored</p>
              </div>
              <div className="ml-auto">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-500">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </div>
            </div>
            
            {/* Post Images */}
            <div className="relative">
              <div className="aspect-w-1 aspect-h-1">
                {/* Side by side comparison */}
                <div className="grid grid-cols-2 h-64">
                  {beforeImageUrl ? (
                    <img 
                      src={beforeImageUrl} 
                      alt="Dog before grooming" 
                      className="object-cover w-full h-full border-r border-white" 
                    />
                  ) : (
                    <div className="bg-gray-100 flex items-center justify-center">
                      <span className="text-sm text-gray-400">Before</span>
                    </div>
                  )}
                  
                  {afterImageUrl ? (
                    <img 
                      src={afterImageUrl} 
                      alt="Dog after grooming" 
                      className="object-cover w-full h-full border-l border-white" 
                    />
                  ) : (
                    <div className="bg-gray-100 flex items-center justify-center">
                      <span className="text-sm text-gray-400">After</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Post Actions */}
            <div className="p-3 flex items-center border-t border-b border-gray-200">
              <button className="mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              <button className="mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </button>
              <button className="mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
              <button className="ml-auto">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>
            </div>
            
            {/* Post Content */}
            <div className="p-3">
              {caption ? (
                <p className="text-sm mb-1">
                  <span className="font-semibold">{salonName.toLowerCase().replace(/\s+/g, "_")}</span>{" "}
                  <span className="whitespace-pre-line">{combinedCaption}</span>
                </p>
              ) : (
                <div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">{format(new Date(), "MM/dd/yyyy").toUpperCase()}</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={onSaveDraft}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Draft"}
            </Button>
            <Button 
              className="bg-[#F59E0B] hover:bg-[#D97706]"
              onClick={onPostToInstagram}
              disabled={isSaving}
            >
              <Instagram className="mr-2 h-4 w-4" /> Post to Instagram
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
