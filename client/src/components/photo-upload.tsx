import { useState, useRef } from "react";
import { Camera, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PhotoUploadProps {
  onPhotosUploaded: (beforeUrl: string, afterUrl: string) => void;
  beforeImageUrl: string;
  afterImageUrl: string;
  isUploading: boolean;
  setIsUploading: (loading: boolean) => void;
}

export default function PhotoUpload({ 
  onPhotosUploaded, 
  beforeImageUrl, 
  afterImageUrl,
  isUploading,
  setIsUploading
}: PhotoUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'before' | 'after' | null>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !uploadType) {
      return;
    }

    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Create FormData for the file upload
      const formData = new FormData();
      if (uploadType === 'before') {
        formData.append('beforeImage', file);
        // If we already have an "after" image, we need to include it again
        if (afterImageUrl) {
          // Fetch the existing "after" image and append it to the form
          const afterResponse = await fetch(afterImageUrl);
          const afterBlob = await afterResponse.blob();
          formData.append('afterImage', new File([afterBlob], 'after.jpg', { type: afterBlob.type }));
        }
      } else {
        formData.append('afterImage', file);
        // If we already have a "before" image, we need to include it again
        if (beforeImageUrl) {
          // Fetch the existing "before" image and append it to the form
          const beforeResponse = await fetch(beforeImageUrl);
          const beforeBlob = await beforeResponse.blob();
          formData.append('beforeImage', new File([beforeBlob], 'before.jpg', { type: beforeBlob.type }));
        }
      }

      // If only one image is being uploaded, check if we need to create a placeholder for the other
      if (uploadType === 'before' && !afterImageUrl) {
        // Create a minimal placeholder canvas for the after image
        const canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#f3f4f6'; // Light gray background
          ctx.fillRect(0, 0, 10, 10);
          
          canvas.toBlob((blob) => {
            if (blob) {
              formData.append('afterImage', new File([blob], 'placeholder.jpg', { type: 'image/jpeg' }));
              uploadFiles(formData);
            }
          }, 'image/jpeg');
        }
      } else if (uploadType === 'after' && !beforeImageUrl) {
        // Create a minimal placeholder canvas for the before image
        const canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#f3f4f6'; // Light gray background
          ctx.fillRect(0, 0, 10, 10);
          
          canvas.toBlob((blob) => {
            if (blob) {
              formData.append('beforeImage', new File([blob], 'placeholder.jpg', { type: 'image/jpeg' }));
              uploadFiles(formData);
            }
          }, 'image/jpeg');
        }
      } else {
        // Both images are being uploaded or already exist
        uploadFiles(formData);
      }
    } catch (error) {
      setIsUploading(false);
      toast({
        title: "Upload error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const uploadFiles = async (formData: FormData) => {
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onPhotosUploaded(
        data.beforeImageUrl,
        data.afterImageUrl
      );
      toast({
        title: "Upload successful",
        description: "Your images have been uploaded.",
      });
    } catch (error) {
      toast({
        title: "Upload error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadType(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = (type: 'before' | 'after') => {
    setUploadType(type);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleTakePhoto = () => {
    toast({
      title: "Camera Access",
      description: "Camera functionality will be available in a future update.",
    });
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Before & After Photos</label>
      <div className="grid grid-cols-2 gap-4">
        {/* Before Photo */}
        <div>
          <div 
            className={`border-2 ${beforeImageUrl ? 'border-solid' : 'border-dashed'} border-gray-300 rounded-lg p-4 h-48 flex flex-col items-center justify-center hover:border-primary transition cursor-pointer relative`}
            onClick={() => triggerFileInput('before')}
          >
            {isUploading && uploadType === 'before' ? (
              <Skeleton className="w-full h-full absolute inset-0 rounded-lg" />
            ) : beforeImageUrl ? (
              <img 
                src={beforeImageUrl} 
                alt="Dog before grooming" 
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="text-center">
                <Camera className="h-8 w-8 text-gray-400 mb-2 mx-auto" />
                <p className="text-sm text-gray-500">Upload Before Photo</p>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1 text-center">Before</p>
        </div>
        
        {/* After Photo */}
        <div>
          <div 
            className={`border-2 ${afterImageUrl ? 'border-solid' : 'border-dashed'} border-gray-300 rounded-lg p-4 h-48 flex flex-col items-center justify-center hover:border-primary transition cursor-pointer relative`}
            onClick={() => triggerFileInput('after')}
          >
            {isUploading && uploadType === 'after' ? (
              <Skeleton className="w-full h-full absolute inset-0 rounded-lg" />
            ) : afterImageUrl ? (
              <img 
                src={afterImageUrl} 
                alt="Dog after grooming" 
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="text-center">
                <Camera className="h-8 w-8 text-gray-400 mb-2 mx-auto" />
                <p className="text-sm text-gray-500">Upload After Photo</p>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1 text-center">After</p>
        </div>
      </div>
      
      {/* Hidden file input */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      
      {/* Photo Action Buttons */}
      <div className="flex justify-center mt-4 gap-3">
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center"
          onClick={handleTakePhoto}
          disabled={isUploading}
        >
          <Camera className="h-4 w-4 mr-1.5" /> Take Photos
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center"
          onClick={() => triggerFileInput(beforeImageUrl ? 'after' : 'before')}
          disabled={isUploading}
        >
          <Image className="h-4 w-4 mr-1.5" /> Upload Photos
        </Button>
      </div>
    </div>
  );
}
