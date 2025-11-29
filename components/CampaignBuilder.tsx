import React, { useState } from 'react';
import { generateCampaignText, generateCampaignImage } from '../services/geminiService';
import { CampaignData, ImageSize } from '../types';
import ReactMarkdown from 'react-markdown';

export const CampaignBuilder: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('Professional');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic) return;
    
    setIsGeneratingText(true);
    setError(null);
    setCampaignData(null);
    setGeneratedImageUrl(null);

    try {
      // 1. Generate Text
      const data = await generateCampaignText(topic, audience, tone);
      setCampaignData(data);
      setIsGeneratingText(false);

      // 2. Generate Image immediately after text is ready
      if (data.imagePrompt) {
        setIsGeneratingImage(true);
        const imageUrl = await generateCampaignImage(data.imagePrompt, imageSize);
        setGeneratedImageUrl(imageUrl);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate campaign.");
    } finally {
      setIsGeneratingText(false);
      setIsGeneratingImage(false);
    }
  };

  const handleRegenerateImage = async () => {
    if (!campaignData?.imagePrompt) return;
    setIsGeneratingImage(true);
    try {
        const imageUrl = await generateCampaignImage(campaignData.imagePrompt, imageSize);
        setGeneratedImageUrl(imageUrl);
    } catch (err: any) {
        setError("Failed to regenerate image: " + err.message);
    } finally {
        setIsGeneratingImage(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-slate-50">
      {/* Sidebar / Controls */}
      <div className="w-full lg:w-1/3 bg-white border-r border-slate-200 p-6 flex flex-col h-full overflow-y-auto z-10 shadow-lg lg:shadow-none">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
           <span className="bg-brand-100 p-2 rounded-lg text-brand-600">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
             </svg>
           </span>
           Campaign Builder
        </h2>
        
        <div className="space-y-6 flex-grow">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Topic / Product</label>
            <textarea
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none h-24"
              placeholder="e.g., Summer clearance sale for hiking boots..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
            <input
              type="text"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="e.g., Outdoor enthusiasts, millennials..."
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tone</label>
              <select
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option>Professional</option>
                <option>Exciting</option>
                <option>Friendly</option>
                <option>Urgent</option>
                <option>Witty</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Image Size</label>
              <select
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value as ImageSize)}
              >
                <option value="1K">1K (Square)</option>
                <option value="2K">2K (High Res)</option>
                <option value="4K">4K (Ultra HD)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
            {error && <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}
            
            <button
                onClick={handleGenerate}
                disabled={isGeneratingText || !topic}
                className={`w-full py-3 px-6 rounded-xl font-bold text-white shadow-lg transition-all 
                  ${isGeneratingText || !topic 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
            >
                {isGeneratingText ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        Generating Campaign...
                    </span>
                ) : (
                    "Generate Campaign"
                )}
            </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="w-full lg:w-2/3 p-4 lg:p-8 overflow-y-auto bg-slate-50">
        {!campaignData ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-lg">Enter details and click Generate to see the magic.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            {/* Subject Lines */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Subject Line Options</h3>
                <ul className="space-y-3">
                    {campaignData.subjectLines.map((subject, idx) => (
                        <li key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-brand-200 transition-colors cursor-copy" title="Click to copy" onClick={() => navigator.clipboard.writeText(subject)}>
                             <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                             <span className="text-slate-800 font-medium">{subject}</span>
                             <span className="ml-auto opacity-0 group-hover:opacity-100 text-xs text-slate-400">Copy</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Email Body & Image */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="ml-4 flex-1 bg-white h-8 rounded-md border border-slate-200 text-xs flex items-center px-3 text-slate-400">
                        Email Preview
                    </div>
                </div>
                
                <div className="p-8">
                    {/* Visual */}
                    <div className="mb-8">
                        {isGeneratingImage ? (
                             <div className="w-full aspect-video bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-400 animate-pulse border-2 border-dashed border-slate-200">
                                <span className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent mb-2"></span>
                                <p className="text-sm">Creating visuals with Gemini 3 Pro ({imageSize})...</p>
                             </div>
                        ) : generatedImageUrl ? (
                             <div className="relative group">
                                <img 
                                    src={generatedImageUrl} 
                                    alt="Generated Marketing Visual" 
                                    className="w-full rounded-lg shadow-md"
                                />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={handleRegenerateImage}
                                        className="bg-white/90 backdrop-blur text-slate-700 text-xs px-3 py-1.5 rounded-full shadow hover:bg-white flex items-center gap-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        Regenerate ({imageSize})
                                    </button>
                                </div>
                                <div className="absolute bottom-2 right-2">
                                     <a href={generatedImageUrl} download="campaign-visual.png" className="bg-black/50 text-white text-xs px-2 py-1 rounded hover:bg-black/70">Download</a>
                                </div>
                             </div>
                        ) : (
                             <div className="w-full aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200">
                                 Image generation failed
                             </div>
                        )}
                         <p className="mt-2 text-xs text-slate-400">Promoted Image: {campaignData.imagePrompt}</p>
                    </div>

                    {/* Copy */}
                    <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-brand-600">
                        <ReactMarkdown>{campaignData.bodyCopy}</ReactMarkdown>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
