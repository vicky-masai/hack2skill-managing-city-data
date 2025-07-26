
export interface Incident {
  type: 'Accident' | 'Traffic Jam' | 'Water Logging' | 'Road Work' | 'Event' | 'Other';
  description: string;
  severity: 'Low' | 'Medium' | 'High';
}

export interface Route {
  routeName: string;
  travelTime: string;
  distance: string;
  trafficCondition: 'Light' | 'Moderate' | 'Heavy';
  congestionLength: string;
  vehicleCount: number;
  incidents: Incident[];
  recommendationScore: number;
  summary: string;
}

export interface RouteAnalysis {
  routes: Route[];
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  image?: string;
}

export interface ImagePayload {
  mimeType: string;
  data: string;
}

export interface DashboardData {
  timeSaved: number;
  distanceTravelled: number;
  fuelSaved: number;
  moneySaved: number;
  incidentsAvoided: number;
}

export interface RouteContext {
  from: string;
  to: string;
}
