import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { notesService } from '../services/notesService';

export default function Notes() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [error, setError] = useState('');

  const handleFetchSummary = async () => {
    setIsGenerating(true);
    setSummaryText('');
    setError('');
    console.log('Fetching unified topic summary from backend via notesService...');

    try {
      // 1. Gather the payload from the service node
      const responseData = await notesService.getNotes();
      console.log('Backend notes response received:', responseData);

      // 2. SAFETY GATE: Unpack payload safely whether it's a string or object matrix
      let parsedNotesText = '';

      if (typeof responseData === 'string') {
        parsedNotesText = responseData;
      } else if (responseData && typeof responseData === 'object') {
        // Fallback checks across common database compilation keys
        parsedNotesText = responseData.summary || 
                          responseData.notes || 
                          responseData.text || 
                          responseData.response || 
                          JSON.stringify(responseData);
      } else {
        parsedNotesText = 'Unable to parse structural content from backend node.';
      }

      setSummaryText(parsedNotesText);
    } catch (err) {
      console.error('Notes retrieval error:', err);
      const errMsg = err.response?.data?.detail || 'Failed to retrieve the topic summary from the server.';
      
      // Also harden error printing to avoid object array crashes here
      setError(Array.isArray(errMsg) ? errMsg[0].msg : typeof errMsg === 'string' ? errMsg : 'Error loading compilation arrays.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 px-6 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <span className="text-xl">📝</span>
            <div>
              <h2 className="text-sm font-semibold text-white">AI Notes Hub</h2>
              <p className="text-xs text-slate-400">Generate a high-yield contextual summary of your study material</p>
            </div>
          </div>
        </header>

        {/* Workspace Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Control Panel */}
          <div className="w-80 border-r border-slate-800/60 p-6 flex flex-col justify-between bg-slate-900/10">
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Active Reference</span>
                <p className="text-sm font-medium text-slate-200 truncate">Vector Database Context</p>
                <p className="text-xs text-slate-500">Source: Parsed Knowledge Base</p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-950/40 p-3 text-xs text-red-400 border border-red-900/50">
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={handleFetchSummary}
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all shadow-md cursor-pointer ${
                isGenerating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10'
              }`}
            >
              {isGenerating ? 'Analyzing Content...' : 'Generate Summary'}
            </button>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-slate-950/40">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-400">Compiling document data matrices...</p>
              </div>
            ) : summaryText ? (
              <div className="max-w-3xl mx-auto space-y-4 bg-slate-900 border border-slate-800/60 p-8 rounded-2xl shadow-xl animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h3 className="text-base font-semibold text-indigo-400 tracking-wide">Topic Summary Blueprint</h3>
                  <span className="text-xs text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800/60">Live Context</span>
                </div>
                
                {/* Safe layout execution container */}
                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap pt-2">
                  {summaryText}
                </div>
              </div>
            ) : (
              /* Initial Empty State */
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800/80 rounded-2xl p-8 text-center max-w-xl mx-auto my-auto">
                <span className="text-4xl mb-3">📄</span>
                <h4 className="text-base font-semibold text-slate-200">Summary Sheet Empty</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Trigger the generator to pull down a refined overview statement directly from the vector storage nodes.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}