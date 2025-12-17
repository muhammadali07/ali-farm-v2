import React, { useState } from 'react';
import { MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { askFarmAssistant } from '../services/geminiService';
import { Language } from '../types';

interface AIChatProps {
  lang: Language;
}

export const AIChat: React.FC<AIChatProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null);
    const answer = await askFarmAssistant(query, "Current farm status: 50 sheep, 3 sick, 12 active investments. Market price for feed is stable.");
    setResponse(answer);
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-agri-600 hover:bg-agri-700 text-white p-4 rounded-full shadow-lg transition-all z-50 flex items-center justify-center"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col animate-fade-in-up">
          <div className="bg-agri-600 p-4 flex justify-between items-center text-white">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="text-lg">🤖</span> {lang === Language.EN ? 'Farm Assistant' : 'Asisten Farm'}
            </h3>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded p-1">
              <X size={18} />
            </button>
          </div>
          
          <div className="p-4 h-80 overflow-y-auto bg-slate-50 text-sm space-y-4">
             {!response && !loading && (
               <p className="text-slate-500 text-center mt-10">
                 {lang === Language.EN ? 'Ask me anything about your sheep or investments!' : 'Tanyakan apa saja tentang domba atau investasi Anda!'}
               </p>
             )}
             
             {loading && (
               <div className="flex justify-center items-center h-full">
                 <Loader2 className="animate-spin text-agri-600" size={32} />
               </div>
             )}

             {response && (
               <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-slate-800 whitespace-pre-wrap">
                 {response}
               </div>
             )}
          </div>

          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === Language.EN ? "Type your question..." : "Ketik pertanyaan..."}
              className="flex-1 bg-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            />
            <button 
              onClick={handleAsk}
              disabled={loading}
              className="bg-agri-600 text-white p-2 rounded-lg hover:bg-agri-700 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};