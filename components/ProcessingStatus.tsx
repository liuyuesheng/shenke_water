
import React from 'react';
import { ProcessingStats } from '../types';

interface Props {
  stats: ProcessingStats;
  isProcessing: boolean;
}

const ProcessingStatus: React.FC<Props> = ({ stats, isProcessing }) => {
  const progressPercent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  
  return (
    <section className="bg-[#0a0a0a] p-8 rounded-[2rem] border border-white/10 shadow-xl overflow-hidden relative group">
      <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div>
          <h2 className="text-xl font-black flex items-center gap-3">
            队列执行进度
            {isProcessing && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/20 tracking-[0.1em] animate-pulse">
                ENGINE ACTIVE
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            已处理 {stats.completed} 份文件，共 {stats.total} 份
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">队列</p>
            <p className="text-2xl font-black text-white">{stats.total}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-widest mb-1">完成</p>
            <p className="text-2xl font-black text-emerald-500">{stats.completed}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest mb-1">错误</p>
            <p className="text-2xl font-black text-red-500">{stats.failed}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 h-2.5 bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </section>
  );
};

export default ProcessingStatus;
