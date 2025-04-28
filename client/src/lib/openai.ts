import { apiRequest } from "@/lib/queryClient";
import { CaptionRequest } from "@shared/schema";

export async function generateCaption(captionRequest: CaptionRequest): Promise<string> {
  try {
    const response = await apiRequest("POST", "/api/generate-caption", captionRequest);
    const data = await response.json();
    return data.caption;
  } catch (error) {
    throw new Error("Failed to generate caption: " + (error as Error).message);
  }
}
