import React, { useEffect, useState, useCallback } from 'react';

// Define a local interface for AIStudio to avoid global namespace conflicts
// while maintaining type safety within this file.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

interface ApiKeyGateProps {
  onReady: () => void;
  forceSelection?: boolean;
}

export const ApiKeyGate: React.FC<ApiKeyGateProps> = ({ onReady, forceSelection = false }) => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(!forceSelection);
  const [error, setError] = useState<string | null>(
    forceSelection ? "The previous API key was invalid or does not have permission for this model." : null
  );

  const checkKey = useCallback(async () => {
    // If we are forcing selection (due to a 403 error previously), skip the auto-check
    if (forceSelection) {
        setLoading(false);
        setHasKey(false);
        return;
    }

    try {
      setLoading(true);
      // Use type assertion to access aistudio on window
      const aiStudio = (window as any).aistudio as AIStudio | undefined;

      if (aiStudio) {
        const selected = await aiStudio.hasSelectedApiKey();
        if (selected) {
          setHasKey(true);
          onReady();
        } else {
          setHasKey(false);
        }
      } else {
        // If window.aistudio is missing, we might be in an environment where the key is already env-injected
        console.warn("window.aistudio not found. Assuming environment key is present.");
        setHasKey(true); 
        onReady();
      }
    } catch (e) {
      console.error("Error checking API key:", e);
      setError("Failed to verify API key status.");
    } finally {
      setLoading(false);
    }
  }, [onReady, forceSelection]);

  useEffect(() => {
    checkKey();
  }, [checkKey]);

  const handleSelectKey = async () => {
    const aiStudio = (window as any).aistudio as AIStudio | undefined;
    if (aiStudio) {
      try {
        await aiStudio.openSelectKey();
        setError(null);
        setHasKey(true);
        onReady();
      } catch (e: any) {
        // Handle specific error "Requested entity was not found"
        if (e.message?.includes("Requested entity was not found")) {
            setHasKey(false);
            alert("Session expired or invalid. Please select a key again.");
        } else {
            console.error(e);
            setError("Failed to select key. Please try again.");
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (hasKey && !forceSelection) return null; // Should not render anything if key is present, parent handles rendering app

  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">API Key Required</h2>
        <p className="text-slate-600 mb-6">
          To use the advanced <b>Gemini 3 Pro</b> models for text and image generation, please select a valid API key with billing enabled.
        </p>
        
        {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 bg-opacity-50">
                {error}
            </div>
        )}
        
        <button
          onClick={handleSelectKey}
          className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Select API Key
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        <p className="mt-4 text-xs text-slate-400">
           See <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-600">billing documentation</a> for details.
        </p>
      </div>
    </div>
  );
};