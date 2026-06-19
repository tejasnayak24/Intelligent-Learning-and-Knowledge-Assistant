import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Chat with PDF', path: '/chat', icon: '💬' },
    { name: 'Generate Notes', path: '/notes', icon: '📝' },
    { name: 'Take Quiz', path: '/quiz', icon: '❓' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800/60 flex flex-col justify-between h-screen sticky top-0">
      <div className="p-6">
        {/* Logo / Title */}
        <div className="flex items-center space-x-2 mb-8">
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ILKA
          </span>
          <span className="text-xs font-semibold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
            v1.0
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500 pl-3'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
              U
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200 truncate max-w-[120px]">Student User</p>
              <p className="text-xs text-slate-500 truncate max-w-[120px]">student@nmamit.in</p>
            </div>
          </div>
          <Link to="/login" className="text-slate-400 hover:text-red-400 transition-colors" title="Sign out">
            logout
          </Link>
        </div>
      </div>
    </aside>
  );
}