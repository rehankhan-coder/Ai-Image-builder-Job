import React from 'react';
import { MOCK_JOBS } from '../constants';
import type { Job } from '../types';
import { MapPinIcon, BuildingOfficeIcon } from './icons';

const JobCard: React.FC<{ job: Job }> = ({ job }) => (
  <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 hover:shadow-xl dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.title}</h3>
        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
            <BuildingOfficeIcon className="w-4 h-4 mr-1.5" />
            {job.company}
        </div>
      </div>
      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
        <MapPinIcon className="w-4 h-4 mr-1.5" />
        {job.location}
      </div>
    </div>
    <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">{job.description}</p>
    <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
            {job.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/50 rounded-full">{tag}</span>
            ))}
        </div>
        <button className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 transform hover:-translate-y-0.5">
            Apply Now
        </button>
    </div>
  </div>
);

const JobBoard: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-6">Open Internships</h2>
      <div className="space-y-6">
        {MOCK_JOBS.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default JobBoard;