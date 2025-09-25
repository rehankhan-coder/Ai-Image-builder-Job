import React, { useState } from 'react';

const PostJob: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Reset form or clear fields if needed
    (e.target as HTMLFormElement).reset();
    setTimeout(() => setSubmitted(false), 5000);
  };

  const inputClasses = "mt-1 block w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors";

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-6">Create a New Job Posting</h2>
      {submitted && (
        <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50 rounded-lg" role="alert">
          <span className="font-medium">Success!</span> Your job has been posted.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
          <input type="text" name="jobTitle" id="jobTitle" required className={inputClasses} placeholder="e.g., Frontend Engineer Intern"/>
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company</label>
          <input type="text" name="company" id="company" required className={inputClasses} placeholder="Your company name"/>
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
          <input type="text" name="location" id="location" required className={inputClasses} placeholder="e.g., San Francisco, CA or Remote"/>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Description</label>
          <textarea name="description" id="description" rows={5} required className={inputClasses} placeholder="Describe the role, responsibilities, and requirements..."/>
        </div>
        <div className="pt-2">
          <button type="submit" className="w-full flex justify-center py-3 px-4 rounded-lg shadow-md text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-lg hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 transform hover:-translate-y-1">
            Publish Job Posting
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;