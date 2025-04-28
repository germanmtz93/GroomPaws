import OpenAI from "openai";
import { CaptionRequest } from "@shared/schema";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-development" });

export async function generateCaption(data: CaptionRequest): Promise<string> {
  try {
    // Construct a detailed prompt for the AI
    const prompt = `Create an engaging, professional Instagram caption for a dog grooming salon's post. 
    
Information about the dog:
- Name: ${data.dogName}
- Grooming service: ${data.groomingService}
${data.notes ? `- Additional notes: ${data.notes}` : ''}
${data.tags ? `- Hashtags to include: ${data.tags}` : ''}

The caption should:
1. Sound friendly and positive
2. Highlight the transformation
3. Mention the dog by name
4. Describe the grooming service in an appealing way
5. End with a call to action like booking an appointment
${data.tags ? '6. Include the provided hashtags at the end' : ''}

Format the caption appropriately for Instagram with emojis and line breaks. Do not include "Caption:" or any other prefix in your response.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional social media marketer specializing in content for pet grooming salons. Your captions are engaging, positive, and highlight the amazing transformations that proper grooming can provide."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
    });

    // Return the generated caption
    return response.choices[0].message.content?.trim() || "";
  } catch (error) {
    console.error("Error generating caption:", error);
    throw new Error(`Failed to generate caption: ${(error as Error).message}`);
  }
}
