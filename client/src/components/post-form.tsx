import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PostFormProps {
  dogName: string;
  setDogName: (value: string) => void;
  groomingService: string;
  setGroomingService: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  tags: string;
  setTags: (value: string) => void;
  onGeneratePost: () => void;
  isGenerating: boolean;
  disabled: boolean;
}

export default function PostForm({
  dogName,
  setDogName,
  groomingService,
  setGroomingService,
  notes,
  setNotes,
  tags,
  setTags,
  onGeneratePost,
  isGenerating,
  disabled
}: PostFormProps) {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="mb-4">
        <Label htmlFor="dogName">Dog's Name</Label>
        <Input
          id="dogName"
          placeholder="Enter dog's name"
          value={dogName}
          onChange={(e) => setDogName(e.target.value)}
          className="mt-1"
          disabled={disabled}
        />
      </div>
      
      <div className="mb-4">
        <Label htmlFor="groomingService">Grooming Service</Label>
        <Select
          value={groomingService}
          onValueChange={setGroomingService}
          disabled={disabled}
        >
          <SelectTrigger id="groomingService" className="mt-1">
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full-groom">Full Groom</SelectItem>
            <SelectItem value="bath-brush">Bath & Brush</SelectItem>
            <SelectItem value="deshed">De-shedding Treatment</SelectItem>
            <SelectItem value="nail-trim">Nail Trim</SelectItem>
            <SelectItem value="custom">Custom Service</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="mb-4">
        <Label htmlFor="additionalNotes">Additional Notes</Label>
        <Textarea
          id="additionalNotes"
          placeholder="Add any special details about this grooming session"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1"
          disabled={disabled}
        />
      </div>
      
      <div className="mb-4">
        <Label htmlFor="postTags">Tags (optional)</Label>
        <Input
          id="postTags"
          placeholder="e.g. #doggrooming #petcare"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="mt-1"
          disabled={disabled}
        />
      </div>
      
      <Button 
        type="button" 
        className="w-full mt-2" 
        onClick={onGeneratePost}
        disabled={isGenerating || disabled}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Caption...
          </>
        ) : (
          "Generate Post"
        )}
      </Button>
    </form>
  );
}
