
import { GoogleGenAI, Type, GenerateContentResponse, Part } from "@google/genai";
import { RouteAnalysis, ImagePayload, RouteContext } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const routeSchema = {
  type: Type.OBJECT,
  properties: {
    routes: {
      type: Type.ARRAY,
      description: "An array of possible routes from the origin to the destination.",
      items: {
        type: Type.OBJECT,
        properties: {
          routeName: { type: Type.STRING, description: "Name of the route, e.g., 'Via Outer Ring Road'." },
          travelTime: { type: Type.STRING, description: "Estimated travel time, e.g., '45 minutes'." },
          distance: { type: Type.STRING, description: "Total distance of the route, e.g., '15 km'." },
          trafficCondition: { type: Type.STRING, enum: ['Light', 'Moderate', 'Heavy'] },
          congestionLength: { type: Type.STRING, description: "Estimated length of traffic congestion, e.g., '2 km'." },
          vehicleCount: { type: Type.INTEGER, description: "Estimated number of vehicles on the congested part of this route." },
          recommendationScore: { type: Type.NUMBER, description: "A score from 1 (worst) to 10 (best) recommending this route." },
          summary: { type: Type.STRING, description: "A brief one-sentence summary of why this route is recommended or not." },
          incidents: {
            type: Type.ARRAY,
            description: "A list of incidents currently on this route.",
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['Accident', 'Traffic Jam', 'Water Logging', 'Road Work', 'Event', 'Other'] },
                description: { type: Type.STRING, description: "A short description of the incident." },
                severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
              },
              required: ['type', 'description', 'severity']
            }
          }
        },
        required: ['routeName', 'travelTime', 'distance', 'trafficCondition', 'congestionLength', 'vehicleCount', 'incidents', 'recommendationScore', 'summary']
      }
    }
  },
  required: ['routes']
};

export const analyzeRoutesWithGemini = async (from: string, to:string): Promise<RouteAnalysis | null> => {
    try {
        const prompt = `Act as a premier real-time traffic analyst for Bengaluru, India. Based on the most current, real-world data available to you, provide a detailed analysis of the best 3-4 routes from "${from}" to "${to}". Your analysis must be grounded in reality, not simulation. For each route, provide accurate estimates for travel time, distance, current traffic conditions (Light, Moderate, Heavy), and list any known, factual incidents like accidents, waterlogging, or road work. Your goal is to provide actionable, truthful travel advice. Do not invent or simulate data.`;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: routeSchema,
            }
        });

        const text = response.text.trim();
        if (!text) {
          console.warn("Gemini response was empty.");
          return null;
        }

        return JSON.parse(text) as RouteAnalysis;
    } catch (error) {
        console.error("Error calling Gemini API for route analysis:", error);
        throw new Error("Failed to get route analysis from Gemini API.");
    }
};

export const chatWithAssistant = async (message: string, context: RouteContext | null, image?: ImagePayload): Promise<string> => {
    try {
        let systemInstruction = `You are "City Pulse AI", a friendly and highly capable assistant for managing civic issues in Bengaluru, India. Your job is to be a helpful, conversational guide for the user.

**IMPORTANT: Route and Traffic Questions**

You have access to the user's current route context.

*   **IF CONTEXT IS PROVIDED (e.g., "from: Koramangala, to: Whitefield"):**
    *   The user has just analyzed this route. Use this context to answer their questions about traffic, conditions, or alternative suggestions for *that specific journey*.
    *   **User Example:** "Is there a faster way?"
    *   **Your Example Response:** "Based on the analysis from ${context?.from || 'your starting point'} to ${context?.to || 'your destination'}, the route via Outer Ring Road is currently the fastest. The other options have heavier congestion."

*   **IF CONTEXT IS NOT PROVIDED:**
    *   If the user asks a generic route question (e.g., "What's the best route?", "How is traffic?"), you **must** ask for their locations.
    *   **User Example:** "What's the best route?"
    *   **Your Example Response:** "I can definitely help with that! Where are you traveling from and to?"

*   **IF USER PROVIDES LOCATIONS IN CHAT:**
    *   Acknowledge the locations and guide them to use the main app feature for the full analysis.
    *   **User Example:** "I need to go from Jayanagar to MG Road."
    *   **Your Example Response:** "Got it. For the most detailed analysis from Jayanagar to MG Road, please use the 'Analyze Routes' feature in the main section. It provides live data, incidents, and multiple route options."

**Civic Issue Reporting Flow:**

1.  **Determine Intent:** Is the user reporting an issue (pothole, garbage, etc.)?
2.  **Check for Completeness:** Does the report have an **issue** and a **location**?
3.  **If Complete:** Acknowledge, confirm you've analyzed any image, and state that the report is "filed" with the correct (simulated) department (e.g., BBMP, BESCOM).
    *   **Example:** "Thank you for reporting the water logging on Sarjapur Road. I've filed a report with the BBMP."
4.  **If Incomplete:** Ask for the specific missing information.
    *   **Example (missing location):** "I can report that fallen tree. Could you please tell me the location?"

**Core Persona:** Be empathetic, efficient, and conversational. Avoid robotic, repetitive answers. Your goal is to make the user feel heard and helped.`;

        if (context) {
            systemInstruction += `\n\n**Current Route Context:** The user is asking about a route from **${context.from}** to **${context.to}**. Use this information when answering questions about their journey.`;
        } else {
            systemInstruction += `\n\n**Current Route Context:** No route has been analyzed yet. If the user asks for route-specific information, you must ask them for their 'from' and 'to' locations.`;
        }


        const textPart = { text: message };
        const imagePart = image ? { inlineData: { mimeType: image.mimeType, data: image.data } } : null;

        const parts: Part[] = [textPart];
        if (imagePart) {
            parts.push(imagePart);
        }

        const contents = { parts };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for chat:", error);
        throw new Error("Failed to get chat response from Gemini API.");
    }
};
