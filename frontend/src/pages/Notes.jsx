import { useState } from 'react';
import Sidebar from '../components/Sidebar';

export default function Notes() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState(null);

  const handleGenerateNotes = () => {
    setIsGenerating(true);
    setGeneratedNotes(null);
    console.log('Requesting summary from backend: POST /notes');

    // Mock API processing delay
    setTimeout(() => {
      setGeneratedNotes({
        chapterSummary: 'This chapter addresses the fundamentals of process management, exploring how modern operating systems schedule, execute, and isolate processes to optimize CPU utilization and prevent system conflicts.',
        keyConcepts: [
          { term: 'Process State', definition: 'The current operational status of an executing program, transitioning dynamically through New, Ready, Running, Waiting, and Terminated states.' },
          { term: 'PCB (Process Control Block)', definition: 'The core kernel data structure that tracks execution state, registers, memory allocations, and program counters for each active process.' },
          { term: 'Context Switch', definition: 'The routine where the CPU saves the exact architectural state of a running task to load another, enabling seamless multitasking.' }
        ],
        importantPoints: [
          'A program is a passive entity stored on disk, whereas a process is an active entity occupying system memory.',
          'Context switching is essential for time-sharing but introduces hardware overhead that decreases throughput.',
          'The short-term scheduler must execute exceptionally fast to select the next ready process for CPU allocation without stalling lines.'
        ]
      });
      setIsGenerating(false);
    }, 1200);
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
              <h2 className="text-sm font-semibold text-white">AI Notes Generator</h2>
            </div>
          </div>
        </header>

        {/* Workspace Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Control Panel */}
          <div className="w-80 border-r border-slate-800/60 p-6 flex flex-col justify-between bg-slate-900/10">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Active Reference</span>
              <p className="text-sm font-medium text-slate-200 truncate">Operating_Systems_Notes.pdf</p>
              <p className="text-xs text-slate-500">Size: 4.2 MB • 24 Pages</p>
            </div>

            <button
              onClick={handleGenerateNotes}
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all shadow-md cursor-pointer ${
                isGenerating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10'
              }`}
            >
              {isGenerating ? 'Compiling Notes...' : 'Compile Smart Notes'}
            </button>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-slate-950/40">
            {isGenerating ? (
              /* Loading View Container */
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-400">Scanning vector embeddings and structuring text data...</p>
              </div>
            ) : generatedNotes ? (
              /* Notes Display View */
              <div className="max-w-3xl mx-auto space-y-8 bg-slate-900 border border-slate-800/60 p-8 rounded-2xl shadow-xl animate-fadeIn">
                
                {/* 1. Chapter Summary */}
                <div className="space-y-2.5">
                  <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Chapter Summary</h3>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-950 border border-slate-800/50 p-4 rounded-xl">
                    {generatedNotes.chapterSummary}
                  </p>
                </div>

                {/* 2. Key Concepts */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Key Concepts</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {generatedNotes.keyConcepts.map((concept, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800/60 p-4 rounded-xl">
                        <span className="text-sm font-semibold text-white block mb-1">{concept.term}</span>
                        <span className="text-sm text-slate-400 leading-relaxed">{concept.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Important Points */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Important Points</h3>
                  <ul className="space-y-2.5">
                    {generatedNotes.importantPoints.map((point, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start space-x-2.5 leading-relaxed">
                        <span className="text-amber-500 mt-1.5 text-[10px]">●</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            ) : (
              /* Initial Empty State */
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800/80 rounded-2xl p-8 text-center max-w-xl mx-auto my-auto">
                <span className="text-4xl mb-3">📝</span>
                <h4 className="text-base font-semibold text-slate-200">No Generated Notes Found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Click the compile button in the control panel to prompt the engine to analyze your active document context.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}