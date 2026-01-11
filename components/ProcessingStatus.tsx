
import React from 'react';
import { ProcessingStats } from '../types';

interface Props {
  stats: ProcessingStats;
  isProcessing: boolean;
}

const ProcessingStatus: React.FC<Props> = ({ stats, isProcessing }) => {
  const progressPercent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  
  return (
    <section className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Batch Status
            {isProcessing && <span className="ml-2 px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 rounded-full animate-pulse">PROCESSING</span>}
          </h2>
          <p className="text-sm text-slate-500">
            {stats.completed} of {stats.total} processed
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-tight">Total</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-center">
            <p className="text-xs text-emerald-500 uppercase tracking-tight">Done</p>
            <p className="text-xl font-bold text-emerald-500">{stats.completed}</p>
          </div>
          <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center">
            <p className="text-xs text-red-500 uppercase tracking-tight">Failed</p>
            <p className="text-xl font-bold text-red-500">{stats.failed}</p>
          </div>
        </div>
      </div>

      <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </section>
  );
};

export default ProcessingStatus;
