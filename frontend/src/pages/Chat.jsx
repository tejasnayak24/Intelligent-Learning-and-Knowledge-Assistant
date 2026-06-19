import { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I've fully parsed your uploaded document. Ask me anything about its contents, and I'll extract answers along with page references.",
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuery = input;
    setInput('');
    setIsTyping(true);

    console.log(`Sending prompt to backend: "${currentQuery}" via chatService`);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `Based on the provided document, here is the information regarding your query. The engine scanned the embedded vector chunks and matched relevant contexts directly associated with your request.`,
          sources: ['Page 4, Paragraph 2', 'Page 12, Table 1.1']
        }
      ]);
    }, 1200);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Sidebar Anchor */}
      <Sidebar />

      {/* Main Chat Frame */}
      <div className="flex-1 flex flex-col h-full bg-slate-950">
        
        {/* Document Status Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/40 px-6 flex items-center bg-blend-normal backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <span className="text-xl">💬</span>
            <div>
              <h2 className="text-sm font-semibold text-white">Document Workspace</h2>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Operating_Systems_Notes.pdf
              </p>
            </div>
          </div>
        </header>

        {/* Message Feed Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 shadow-md border ${
                  msg.sender === 'user'
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

          {/* Typing Indicator Box */}
          {isTyping && (
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
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the document structure..."
              className="flex-1 bg-transparent border-0 outline-hidden px-3 text-sm text-white placeholder-slate-500"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`px-4 py-2 rounded-lg font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                input.trim() && !isTyping
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

      </div>
    </div>
  );
}