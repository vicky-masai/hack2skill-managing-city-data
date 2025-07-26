
export interface Route {
  routeName: string;
  travelTime: number;
  trafficLevel: 'Low' | 'Medium' | 'High' | 'Severe';
  incidentSummary: string;
  prediction: string;
}

export interface IncidentReport {
    category: 'Traffic Jam' | 'Road Hazard' | 'Civic Issue' | 'Public Event' | 'Other';
    summary: string;
    suggestedDepartment: string;
}

export interface HistoryItem {
  id: string;
  from: string;
  to: string;
  routes: Route[];
  timestamp: Date;
}

export enum View {
    ANALYZER = 'ANALYZER',
    DASHBOARD = 'DASHBOARD'
}
