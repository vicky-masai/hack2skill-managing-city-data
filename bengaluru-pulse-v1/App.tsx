
import React, { useState, useCallback } from 'react';
import { HistoryItem, View } from './types';
import HistorySidebar from './components/HistorySidebar';
import RouteAnalyzer from './components/RouteAnalyzer';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import { AppContextProvider } from './hooks/useAppContext';


function App() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeView, setActiveView] = useState<View>(View.ANALYZER);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  const addHistoryItem = useCallback((item: Omit<HistoryItem, 'id'>) => {
    setHistory(prev => {
      const newItem: HistoryItem = { ...item, id: Date.now().toString() };
      setActiveHistoryId(newItem.id);
      return [newItem, ...prev];
    });
  }, []);

  const selectHistoryItem = useCallback((id: string) => {
    setActiveHistoryId(id);
    setActiveView(View.ANALYZER); // Switch to analyzer view when a history item is clicked
  }, []);

  const activeItem = history.find(item => item.id === activeHistoryId);

  return (
    <AppContextProvider value={{ history, addHistoryItem, activeItem }}>
      <div className="flex h-screen w-full bg-brand-bg-dark font-sans">
        <HistorySidebar 
          onSelectHistory={selectHistoryItem} 
          activeHistoryId={activeHistoryId}
          onNewAnalysis={() => {
            setActiveHistoryId(null);
            setActiveView(View.ANALYZER);
          }}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header activeView={activeView} setActiveView={setActiveView} />
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {activeView === View.ANALYZER && <RouteAnalyzer />}
            {activeView === View.DASHBOARD && <Dashboard />}
          </div>
        </main>
      </div>
    </AppContextProvider>
  );
}

export default App;
