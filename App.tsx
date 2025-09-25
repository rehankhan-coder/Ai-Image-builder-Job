import React, { useState, useCallback, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import JobBoard from './components/JobBoard';
import PostJob from './components/PostJob';
import Assistant from './components/Assistant';
import type { User } from './types';
import { UserType } from './types';
import { BuildingOfficeIcon, BriefcaseIcon, SparklesIcon } from './components/icons';

type Tab = 'job-board' | 'post-job' | 'assistant';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('job-board');
  const [theme, setTheme] = useState<Theme>(localStorage.getItem('theme') as Theme || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const handleLogin = useCallback((userType: UserType) => {
    setUser({
      name: userType === UserType.STUDENT ? 'Alex Doe' : 'Rehan Khan',
      email: userType === UserType.STUDENT ? 'alex.doe@university.edu' : 'rehan5426nasar@gmail.com',
      userType: userType,
    });
    setActiveTab(userType === UserType.STUDENT ? 'job-board' : 'post-job');
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'job-board':
        return <JobBoard />;
      case 'post-job':
        return <PostJob />;
      case 'assistant':
        return <Assistant user={user!} />;
      default:
        return <JobBoard />;
    }
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const navItems = [
    { id: 'job-board', label: 'Job Board', icon: <BriefcaseIcon className="w-5 h-5 mr-3" />, show: user.userType === UserType.STUDENT },
    { id: 'post-job', label: 'Create Job Posting', icon: <BuildingOfficeIcon className="w-5 h-5 mr-3" />, show: user.userType === UserType.COMPANY },
    { id: 'assistant', label: 'AI Assistant', icon: <SparklesIcon className="w-5 h-5 mr-3" />, show: true },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Header user={user} onLogout={handleLogout} theme={theme} setTheme={setTheme} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64">
            <nav className="space-y-2">
              {navItems.filter(item => item.show).map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 group transform focus:outline-none focus:ring-4 focus:ring-blue-500/30 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <span className={activeTab === item.id ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300'}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
          <div className="flex-1">
            <div className="bg-white dark:bg-slate-900/80 dark:backdrop-blur-sm rounded-xl shadow-lg dark:shadow-black/20 border border-slate-200 dark:border-slate-800 p-6 md:p-8 min-h-[calc(100vh-12rem)]">
              {renderActiveTab()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;