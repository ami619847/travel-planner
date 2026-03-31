import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { z } from 'zod';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is missing from environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// Define schema for Zod validation (frontend/backend safety)
const ItinerarySchema = z.object({
  tripTitle: z.string(),
  destination: z.string(),
  days: z.array(
    z.object({
      day: z.number(),
      theme: z.string(),
      activities: z.array(
        z.object({
          time: z.string(), // e.g., "Morning"
          activity: z.string(),
          location: z.string().optional(),
          description: z.string()
        })
      )
    })
  )
});

export type GeneratedItinerary = z.infer<typeof ItinerarySchema>;

export const generateItinerary = async (
  destination: string, 
  durationDays: number, 
  budget: string,
  interests: string[]
): Promise<GeneratedItinerary | null> => {
  // Senior approach: Use a specific model configuration with JSON response constraints
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
    systemInstruction: "You are an expert travel consultant. You provide structured itineraries in JSON format. Always include specific local landmarks."
  });

  const prompt = `Create a ${durationDays}-day travel itinerary for ${destination} with a ${budget} budget. Interests: ${interests.join(', ')}.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) return null;

    // Validate the AI output against our Zod schema
    const parsedData = JSON.parse(text);
    return ItinerarySchema.parse(parsedData);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return null;
  }
};
