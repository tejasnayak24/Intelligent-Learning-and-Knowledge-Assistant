import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { chatService } from '../services/chatService';

export default function Chat() {
  const [messages, setMessages] = useState([]); // FIXED: Initialized empty to prevent fake greeting
  const [hasDocument, setHasDocument] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [inputMessage, setInputMessage] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);    
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Initial Pre-flight Document Verification
  useEffect(() => {
    const verifyDocumentContext = async () => {
      setIsCheckingStatus(true);
      const status = await chatService.checkVectorStatus();
      
      if (status.faiss_exists && status.chunks_exists) {
        setHasDocument(true);
        // Load the greeting only if the indices physically exist on the server
        setMessages([
          {
            id: 1,
            sender: 'ai',
            isBot: true, 
            text: "Hello! I've fully parsed your uploaded document. Ask me anything about its contents, and I'll extract answers along with page references.",
            sources: []
          }
        ]);
      } else {
        setHasDocument(false);
      }
      setIsCheckingStatus(false);
    };

    verifyDocumentContext();
  }, []);

  // 2. Scroll to bottom hook
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

    const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userQuery = inputMessage.trim();
    setInputMessage('');

    setMessages((prev) => [...prev, { text: userQuery, isBot: false, sender: 'user' }]);
    setIsLoading(true);

    console.log(`Sending prompt to backend: "${userQuery}" via chatService`);

    try {
      // 1. Await response from backend vector engine
      const aiResponse = await chatService.askQuestion(userQuery);
      console.log('Backend response received:', aiResponse);

      // 2. FIXED: Robust type checking to prevent object-rendering crashes
      let botText = '';
      let botSources = [];

      if (typeof aiResponse === 'string') {
        botText = aiResponse;
      } else if (aiResponse && typeof aiResponse === 'object') {
        // Fallback checks for common RAG object keys (answer, response, or message)
        botText = aiResponse.answer || aiResponse.response || aiResponse.message || JSON.stringify(aiResponse);
        botSources = Array.isArray(aiResponse.sources) ? aiResponse.sources : [];
      } else {
        botText = 'Received an invalid data format from the server.';
      }
      
      // 3. Update state with pure strings and arrays
      setMessages((prev) => [
        ...prev, 
        { text: botText, isBot: true, sender: 'ai', sources: botSources }
      ]);
    } catch (err) {
      console.error('Chat routing execution exception:', err);
      const errMsg = err.response?.data?.detail || 'Engine error parsing context arrays.';
      
      setMessages((prev) => [
        ...prev, 
        { text: `⚠️ Error: ${typeof errMsg === 'string' ? errMsg : 'Failed to connect to assistant node.'}`, isBot: true, sender: 'ai' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full bg-slate-950">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 px-6 flex items-center backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <span className="text-xl">💬</span>
            <div>
              <h2 className="text-sm font-semibold text-white">Document Workspace</h2>
              <p className="text-xs text-slate-400">
                {isCheckingStatus ? 'Verifying Index...' : hasDocument ? 'RAG Analysis Engine Online' : 'No Document Context Active'}
              </p>
            </div>
          </div>
        </header>

        {/* Dynamic Canvas Body */}
        {isCheckingStatus ? (
          // Loading State
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !hasDocument ? (
          // FIXED: Instructive Empty Placeholder View if backend vector index is missing
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shadow-inner">
              📂
            </div>
            <h3 className="text-lg font-semibold text-white">No active documents found</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Before you can start querying the chat intelligence matrix, you need to upload your PDF study material to build the system vector index maps.
            </p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              Go to Dashboard →
            </Link>
          </div>
        ) : (
          // Message Feed Canvas (Only renders if vector files are verified)
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl p-4 shadow-md border ${
                      msg.isBot
                        ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none'
                        : 'bg-slate-900 border-slate-800/80 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {msg.sender === 'ai' && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800/60">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          References:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((source, i) => (
                            <span
                              key={i}
                              className="text-[11px] bg-slate-950 text-indigo-400 border border-slate-800 px-2 py-0.5 rounded-md font-medium"
                            >
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && ( 
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl rounded-tl-none p-4 flex items-center space-x-2 shadow-md">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Floating Input Dock */}
            <footer className="p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
              <form
                onSubmit={handleSendMessage}
                className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-center shadow-2xl focus-within:border-indigo-500 transition-all"
              >
                <input
                  type="text"
                  value={inputMessage} 
                  onChange={(e) => setInputMessage(e.target.value)} 
                  placeholder="Ask a question about the document structure..."
                  className="flex-1 bg-transparent border-0 outline-none px-3 text-sm text-white placeholder-slate-500"
                  disabled={isLoading} 
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading} 
                  className={`px-4 py-2 rounded-lg font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    inputMessage.trim() && !isLoading
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Send</span>
                  <span className="transform transition-transform group-hover:translate-x-1">→</span>
                </button>
              </form>
              <p className="text-center text-[10px] text-slate-600 mt-2">
                AI-assisted learning based on your notes. Cross-verify important points as you study.
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}