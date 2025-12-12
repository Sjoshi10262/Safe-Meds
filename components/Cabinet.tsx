import React, { useState } from 'react';
import { DrugAnalysis, SafetyStatus } from '../types';
import { Pill, Trash2, Calendar, AlertCircle, Search, Sparkles, Activity, CheckCircle2, ScanLine } from 'lucide-react';

interface Props {
  medications: DrugAnalysis[];
  onRemove: (timestamp: number) => void;
  onView: (med: DrugAnalysis) => void;
  onScan: () => void;
}

const Cabinet: React.FC<Props> = ({ medications, onRemove, onView, onScan }) => {
  const [checking, setChecking] = useState(false);
  const [safetyMessage, setSafetyMessage] = useState<string | null>(null);

  const sortedMeds = [...medications].sort((a, b) => {
    if (a.status === SafetyStatus.DANGER && b.status !== SafetyStatus.DANGER) return -1;
    if (b.status === SafetyStatus.DANGER && a.status !== SafetyStatus.DANGER) return 1;
    return b.timestamp - a.timestamp;
  });

  const runCabinetCheck = () => {
    setChecking(true);
    // Simulation of AI check across all items
    setTimeout(() => {
        setChecking(false);
        const dangerous = medications.filter(m => m.status === SafetyStatus.DANGER).length;
        if (dangerous > 0) {
            setSafetyMessage(`${dangerous} items conflict with your profile!`);
        } else {
            setSafetyMessage("All cabinet items appear safe together.");
        }
        setTimeout(() => setSafetyMessage(null), 4000);
    }, 2000);
  };

  const getExpiryStatus = (med: DrugAnalysis) => {
    const hash = med.timestamp % 3;
    if (hash === 0) return { label: 'Expiring Soon', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' };
    return { label: 'Good', color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' };
  };

  return (
    <div className="h-full w-full flex flex-col p-6 pb-32 overflow-y-auto no-scrollbar relative">
      
      {/* Header */}
      <div className="mb-6 pt-2 animate-slide-up flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Smart Cabinet</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Manage & monitor {medications.length} items.</p>
         </div>
         {medications.length > 1 && (
             <button 
                onClick={runCabinetCheck}
                disabled={checking}
                className="flex flex-col items-center gap-1 group"
             >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${checking ? 'bg-blue-100 text-blue-500 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-blue-100 hover:text-blue-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-400'}`}>
                    <Activity size={20} className={checking ? 'animate-spin' : ''} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Check</span>
             </button>
         )}
      </div>

      {safetyMessage && (
          <div className="mb-6 bg-blue-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-slide-up">
              {safetyMessage.includes('conflict') ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
              <span className="font-bold text-sm">{safetyMessage}</span>
          </div>
      )}

      {/* Search Bar */}
      <div className="mb-8 relative animate-slide-up-delay-1">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
           <Search size={18} />
        </div>
        <input 
           type="text" 
           placeholder="Search cabinet..." 
           className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
        />
      </div>

      {/* Grid */}
      {medications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50 animate-slide-up-delay-2">
           <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Pill size={32} className="text-slate-400" />
           </div>
           <p className="text-lg font-bold text-slate-500">Cabinet is empty</p>
           <p className="text-xs text-slate-400">Scan meds to add them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 animate-slide-up-delay-2">
           {sortedMeds.map((med, idx) => {
             const expiry = getExpiryStatus(med);
             return (
               <div key={idx} className="group relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/40 dark:border-slate-800 rounded-[1.5rem] p-4 shadow-sm hover:shadow-lg transition-all active:scale-[0.99] flex gap-4 overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${med.status === SafetyStatus.SAFE ? 'bg-emerald-500' : med.status === SafetyStatus.DANGER ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${med.status === SafetyStatus.SAFE ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' : med.status === SafetyStatus.DANGER ? 'bg-rose-100 dark:bg-rose-900/20 text-rose-600' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-600'}`}>
                      <Pill size={24} />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center" onClick={() => onView(med)}>
                     <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg truncate">{med.drugName}</h3>
                     </div>
                     <p className="text-xs text-slate-500 truncate mb-2">{med.activeIngredient}</p>
                     <div className="flex items-center gap-2">
                        <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${expiry.bg} ${expiry.color}`}>
                           <Calendar size={10} />
                           {expiry.label}
                        </div>
                     </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onRemove(med.timestamp); }} className="self-center p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-colors">
                     <Trash2 size={18} />
                  </button>
               </div>
             );
           })}
        </div>
      )}

      {/* Quick Add FAB */}
      <button 
        onClick={onScan}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_10px_30px_rgba(37,99,235,0.5)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40 animate-slide-up-delay-3"
      >
        <ScanLine size={24} />
      </button>

    </div>
  );
};

export default Cabinet;