import React from 'react';
import { UserType } from '../types';
import { SparklesIcon, BriefcaseIcon, BuildingOfficeIcon } from './icons';

interface AuthScreenProps {
  onLogin: (userType: UserType) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4 transition-colors duration-300">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm rounded-2xl shadow-2xl dark:shadow-black/30 border border-slate-200 dark:border-slate-700">
        <div className="text-center">
            <div className="flex justify-center items-center mb-4">
                <SparklesIcon className="w-10 h-10 text-blue-600 dark:text-blue-500" />
            </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Welcome to JobLink AI</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Your intelligent career platform.</p>
        </div>
        
        <div className="space-y-4 pt-4">
            <p className="text-center font-medium text-slate-600 dark:text-slate-300">Choose your role to get started:</p>
            <button
            onClick={() => onLogin(UserType.STUDENT)}
            className="w-full flex items-center justify-center px-4 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
            <BriefcaseIcon className="w-5 h-5 mr-2" />
            I'm a Student
            </button>
            <button
            onClick={() => onLogin(UserType.COMPANY)}
            className="w-full flex items-center justify-center px-4 py-3 font-semibold text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/50 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/60 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
            <BuildingOfficeIcon className="w-5 h-5 mr-2" />
            I'm a Company
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;