
import React, { useState, useCallback } from 'react';
import { RouteAnalysis, ChatMessage, ImagePayload, DashboardData, RouteContext } from './types';
import TravelHistory from './components/TravelHistory';
import RouteInput from './components/RouteInput';
import RouteVisualizer from './components/RouteVisualizer';
import AiAssistant from './components/AiAssistant';
import Header from './components/Header';
import DashboardStats from './components/DashboardStats';
import { analyzeRoutesWithGemini, chatWithAssistant } from './services/geminiService';
import { Toaster, toast } from './components/ui/sonner';

// Constants for dashboard calculations
const AVERAGE_MILEAGE_KMPL = 15;
const FUEL_PRICE_INR = 105;


export default function App() {
  const [routeAnalysis, setRouteAnalysis] = useState<RouteAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: "Hello! I'm your city assistant. Report an issue or ask me about your route." }
  ]);
  const [isAssistantLoading, setIsAssistantLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const [routeContext, setRouteContext] = useState<RouteContext | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    timeSaved: 7.2,
    distanceTravelled: 1240,
    fuelSaved: 95,
    moneySaved: 9800,
    incidentsAvoided: 58,
  });

  const handleRouteAnalysis = useCallback(async (from: string, to: string) => {
    setIsLoading(true);
    setRouteAnalysis(null);
    const searchKey = `${from} to ${to}`;
    setRouteContext({ from, to });

    try {
      const result = await analyzeRoutesWithGemini(from, to);
      if (result && result.routes && result.routes.length > 0) {
        setRouteAnalysis(result);
        if (!history.includes(searchKey)) {
          setHistory(prev => [searchKey, ...prev]);
        }
        
        // Update dashboard stats based on the best route
        const bestRoute = result.routes.reduce((prev, current) => (prev.recommendationScore > current.recommendationScore) ? prev : current);
        const incidentsOnOtherRoutes = result.routes.filter(r => r.routeName !== bestRoute.routeName).reduce((sum, r) => sum + r.incidents.length, 0);

        const distanceKm = parseFloat(bestRoute.distance) || 0;
        // Assuming a "saved time" metric isn't directly available, we can add a fraction of travel time or a constant
        const timeHoursSaved = (parseFloat(bestRoute.travelTime) || 0) / 60 / 10; // Fictional "saved" time for demo

        const fuelUsed = distanceKm / AVERAGE_MILEAGE_KMPL;
        const moneySpent = fuelUsed * FUEL_PRICE_INR;

        setDashboardData(prevData => ({
            distanceTravelled: prevData.distanceTravelled + distanceKm,
            timeSaved: prevData.timeSaved + timeHoursSaved,
            fuelSaved: prevData.fuelSaved + (fuelUsed / 2), // Fictional "saved" fuel
            moneySaved: prevData.moneySaved + (moneySpent / 2), // Fictional "saved" money
            incidentsAvoided: prevData.incidentsAvoided + incidentsOnOtherRoutes,
        }));

      } else {
        toast.error('AI could not generate routes. The response might be blocked or empty.');
      }
    } catch (error) {
      console.error("Error analyzing routes:", error);
      toast.error('Failed to analyze routes. Please check your API key and network connection.');
    } finally {
      setIsLoading(false);
    }
  }, [history]);

  const handleHistoryClick = (searchKey: string) => {
    const [from, to] = searchKey.split(' to ');
    if(from && to) {
        handleRouteAnalysis(from, to);
    }
  };

  const handleAssistantChat = useCallback(async (message: string, image?: ImagePayload, previewUrl?: string | null) => {
    setChatMessages(prev => [...prev, { sender: 'user', text: message, image: previewUrl || undefined }]);
    setIsAssistantLoading(true);
    try {
      const response = await chatWithAssistant(message, routeContext, image);
      setChatMessages(prev => [...prev, { sender: 'ai', text: response }]);
    } catch (error) {
      console.error("Error with AI assistant:", error);
      setChatMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I encountered an error processing your report. Please try again." }]);
      toast.error("Failed to get response from assistant.");
    } finally {
      setIsAssistantLoading(false);
    }
  }, [routeContext]);

  return (
    <>
      <Toaster position="top-center" theme="dark" />
      <div className="flex h-screen w-full bg-gray-900 text-gray-100 font-sans">
        {/* Left Sidebar: Travel History */}
        <aside className="w-64 bg-gray-900 border-r border-gray-700/50 flex flex-col p-4 space-y-4">
          <TravelHistory history={history} onHistoryClick={handleHistoryClick} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
            <DashboardStats stats={dashboardData} />
            <RouteInput onAnalyze={handleRouteAnalysis} isLoading={isLoading} />
            <RouteVisualizer analysis={routeAnalysis} isLoading={isLoading} />
          </div>
        </main>

        {/* Right Sidebar: AI Assistant */}
        <aside className="w-96 bg-gray-800/50 border-l border-gray-700/50 flex flex-col">
          <AiAssistant 
            messages={chatMessages} 
            onSendMessage={handleAssistantChat}
            isLoading={isAssistantLoading}
          />
        </aside>
      </div>
    </>
  );
}
