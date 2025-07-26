
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Route, IncidentReport } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const parseJsonFromMarkdown = <T,>(text: string): T => {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match && match[1]) {
        return JSON.parse(match[1]) as T;
    }
    // Fallback for cases where markdown is not used
    try {
        return JSON.parse(text) as T;
    } catch(e) {
        console.error("Failed to parse JSON directly, raw text:", text);
        throw new Error("Invalid JSON response from AI");
    }
};

export async function analyzeRoutes(from: string, to: string): Promise<Route[]> {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    You are a Bengaluru city traffic analysis agent. Given a start location "${from}" and a destination "${to}", your task is to act as if you are analyzing real-time data from various sources (social media, news, traffic feeds).
    
    Generate 3 plausible routes between these locations. For each route, provide a JSON object with the following structure:
    - routeName: A descriptive name for the route (e.g., "Via MG Road & Hosur Road").
    - travelTime: An estimated travel time in minutes (e.g., 45).
    - trafficLevel: A category for traffic conditions: "Low", "Medium", "High", or "Severe".
    - incidentSummary: A concise, synthesized summary of any incidents on this route. If there are no incidents, state that the route is clear. Synthesize multiple imaginary data points into one clear message. For example, instead of 'accident at location X', 'stalled car at location Y', say 'Heavy traffic on Old Airport Road due to an accident and a stalled vehicle near Marathahalli. Consider alternative routes.'
    - prediction: A short predictive statement. For example, 'Traffic may worsen during evening peak hours.' or 'With ongoing construction, delays are expected for the next few weeks.'

    Here are some example incident types to inspire your generation: traffic jam, accident, road construction, water logging, fallen tree, public event/procession, VIP movement, vehicle breakdown.

    Return ONLY a valid JSON array of these 3 route objects, inside a JSON markdown block.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const routes = parseJsonFromMarkdown<Route[]>(response.text);
    if (!Array.isArray(routes) || routes.length === 0) {
        throw new Error("AI returned an invalid or empty array of routes.");
    }
    return routes;
  } catch (error) {
    console.error("Error calling Gemini API for route analysis:", error);
    throw new Error("Failed to communicate with the AI agent for route analysis.");
  }
}

export async function analyzeIncident(base64Image: string, description: string): Promise<IncidentReport> {
    const model = 'gemini-2.5-flash';

    const textPart = {
      text: `
        You are a civic issue analysis agent for Bengaluru. Analyze the provided image and user description. Based on the content, provide a JSON object with the following structure:
        - category: Classify the incident into one of these categories: "Traffic Jam", "Road Hazard" (e.g., pothole, fallen tree), "Civic Issue" (e.g., garbage pile, water leak), "Public Event", or "Other".
        - summary: A concise, one-sentence description of the situation based on the image and text.
        - suggestedDepartment: Suggest the most appropriate government department to handle this issue. Examples: "BBMP (Municipal Corp)", "Bengaluru Traffic Police", "BESCOM (Electricity)", "BWSSB (Water Board)".

        User Description: "${description}"

        Return ONLY a valid JSON object inside a JSON markdown block.
      `
    };

    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: { parts: [textPart, imagePart] },
            config: {
                responseMimeType: 'application/json'
            }
        });
        
        const report = parseJsonFromMarkdown<IncidentReport>(response.text);
        if(!report.category || !report.summary || !report.suggestedDepartment) {
            throw new Error("AI returned an incomplete incident report.");
        }
        return report;

    } catch (error) {
        console.error("Error calling Gemini API for incident analysis:", error);
        throw new Error("Failed to communicate with the AI agent for incident analysis.");
    }
}
