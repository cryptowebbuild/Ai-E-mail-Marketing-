import React, { useState } from 'react';
import { ApiKeyGate } from './components/ApiKeyGate';
import { CampaignBuilder } from './components/CampaignBuilder';
import { ChatBot } from './components/ChatBot';
import { AppView } from './types';

function App() {
  const [isKeyReady, setIsKeyReady] = useState(false);
  const [forceKeySelection, setForceKeySelection] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.CAMPAIGN);

  const handleApiKeyError = () => {
    setForceKeySelection(true);
    setIsKeyReady(false);
  };

  if (!isKeyReady) {
    return (
        <ApiKeyGate 
            onReady={() => {
                setIsKeyReady(true);
                setForceKeySelection(false);
            }} 
            forceSelection={forceKeySelection} 
        />
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900 font-sans">
      
      {/* Sidebar Navigation (Desktop) */}
      <nav className="hidden md:flex flex-col w-20 bg-slate-900 items-center py-6 gap-6 z-50">
        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/40 mb-4">
          M
        </div>
        
        <button
          onClick={() => setCurrentView(AppView.CAMPAIGN)}
          className={`p-3 rounded-xl transition-all ${
            currentView === AppView.CAMPAIGN 
              ? 'bg-brand-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Campaign Generator"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </button>

        <button
          onClick={() => setCurrentView(AppView.CHAT)}
          className={`p-3 rounded-xl transition-all ${
            currentView === AppView.CHAT 
              ? 'bg-brand-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="AI Assistant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-slate-900 flex items-center justify-between px-4 z-50">
           <div className="text-white font-bold text-lg">MarketerAI</div>
           <div className="flex gap-2">
             <button
               onClick={() => setCurrentView(AppView.CAMPAIGN)}
               className={`p-2 rounded ${currentView === AppView.CAMPAIGN ? 'bg-brand-600 text-white' : 'text-slate-400'}`}
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
             </button>
             <button
               onClick={() => setCurrentView(AppView.CHAT)}
               className={`p-2 rounded ${currentView === AppView.CHAT ? 'bg-brand-600 text-white' : 'text-slate-400'}`}
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
             </button>
           </div>
        </header>

        {/* View Rendering */}
        <main className="flex-1 overflow-hidden relative">
          {currentView === AppView.CAMPAIGN && <CampaignBuilder onApiKeyError={handleApiKeyError} />}
          {currentView === AppView.CHAT && <ChatBot onApiKeyError={handleApiKeyError} />}
        </main>
      </div>
    </div>
  );
}

export default App;