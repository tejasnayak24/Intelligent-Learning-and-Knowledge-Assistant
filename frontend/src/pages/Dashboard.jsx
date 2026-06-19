import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; // Ensure this matches your file resolution pathway

export default function Dashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Upload PDF',
      description: 'Upload your study notes, textbooks, or research papers to initialize the AI engine.',
      icon: '📄',
      color: 'from-blue-600/20 to-cyan-600/20 text-cyan-400 border border-cyan-500/30',
      actionText: 'Upload Document',
      path: '/dashboard',
      onClick: () => alert('Trigger file input selector!'),
    },
    {
      title: 'Chat with PDF',
      description: 'Ask natural language questions and get precise context-aware answers with citations.',
      icon: '💬',
      color: 'from-indigo-600/20 to-purple-600/20 text-indigo-400 border border-indigo-500/30',
      actionText: 'Open Chat',
      path: '/chat',
    },
    {
      title: 'Generate Notes',
      description: 'Transform extensive reading material into concise summaries and key bullet points automatically.',
      icon: '📝',
      color: 'from-emerald-600/20 to-teal-600/20 text-emerald-400 border border-emerald-500/30',
      actionText: 'Create Summaries',
      path: '/notes',
    },
    {
      title: 'Generate Quiz',
      description: 'Test your understanding with automated multiple-choice questions curated from your text.',
      icon: '❓',
      color: 'from-amber-600/20 to-orange-600/20 text-amber-400 border border-amber-500/30',
      actionText: 'Start Quiz',
      path: '/quiz',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <Sidebar />

      <main className="flex-1 p-10 max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome back, Learner!
          </h1>
          <p className="mt-2 text-base text-slate-400">
            Select a tool below to process your materials and optimize your study workflow.
          </p>
        </header>

        {/* Feature Interactive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-slate-900 p-6 rounded-2xl border border-slate-800/80 shadow-lg flex flex-col justify-between hover:border-slate-700 hover:shadow-xl transition-all group"
            >
              <div>
                {/* Decorative Icon Background */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-xl font-bold mb-5`}>
                  {card.icon}
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  {card.description}
                </p>
              </div>

              <div>
                <button
                  onClick={card.onClick ? card.onClick : () => navigate(card.path)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-800 text-sm font-medium text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all cursor-pointer shadow-xs"
                >
                  <span>{card.actionText}</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}