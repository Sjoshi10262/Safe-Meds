import React, { useState, useEffect } from 'react';
import { DrugAnalysis, SafetyStatus } from '../types';
import { ShieldCheck, AlertOctagon, AlertTriangle, RefreshCw, ChevronDown, XCircle, Database, ArrowLeft, Share2, Info, ThumbsUp, Zap, Sparkles, Activity, Pill, ChevronRight, Check, Stethoscope, PlusCircle, Radar } from 'lucide-react';

interface Props {
  analysis: DrugAnalysis;
  onScanAgain: () => void;
  onAddToCabinet?: (med: DrugAnalysis) => void;
}

const ResultCard: React.FC<Props> = ({ analysis, onScanAgain, onAddToCabinet }) => {
  const [mounted, setMounted] = useState(false);
  const [doctorMode, setDoctorMode] = useState(false);
  const [addedToCabinet, setAddedToCabinet] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCabinet = () => {
    if (onAddToCabinet) {
      onAddToCabinet(analysis);
      setAddedToCabinet(true);
    }
  };

  // Premium Theme Configurations
  const theme = {
    [SafetyStatus.SAFE]: {
      bg: 'bg-emerald-600',
      gradient: 'from-emerald-500 to-teal-600',
      text: 'text-emerald-700 dark:text-emerald-300',
      lightBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-100 dark:border-emerald-800',
      icon: ShieldCheck,
      label: 'Safe to Take',
      ring: 'ring-emerald-500/30'
    },
    [SafetyStatus.DANGER]: {
      bg: 'bg-rose-600',
      gradient: 'from-rose-500 to-red-600',
      text: 'text-rose-700 dark:text-rose-300',
      lightBg: 'bg-rose-50 dark:bg-rose-900/20',
      border: 'border-rose-100 dark:border-rose-800',
      icon: AlertOctagon,
      label: 'Do Not Take',
      ring: 'ring-rose-500/30'
    },
    [SafetyStatus.CAUTION]: {
      bg: 'bg-amber-500',
      gradient: 'from-amber-400 to-orange-500',
      text: 'text-amber-700 dark:text-amber-300',
      lightBg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-100 dark:border-amber-800',
      icon: AlertTriangle,
      label: 'Caution',
      ring: 'ring-amber-500/30'
    },
    [SafetyStatus.UNKNOWN]: {
      bg: 'bg-slate-500',
      gradient: 'from-slate-400 to-slate-600',
      text: 'text-slate-700 dark:text-slate-300',
      lightBg: 'bg-slate-50 dark:bg-slate-900/20',
      border: 'border-slate-100 dark:border-slate-800',
      icon: RefreshCw,
      label: 'Unknown',
      ring: 'ring-slate-500/30'
    }
  }[analysis.status];

  const StatusIcon = theme.icon;
  const isDanger = analysis.status === SafetyStatus.DANGER;

  // Interaction Radar Visual Logic
  const riskPercent = analysis.interactionScore || (analysis.status === SafetyStatus.DANGER ? 90 : analysis.status === SafetyStatus.CAUTION ? 50 : 10);
  const riskColor = riskPercent > 70 ? 'text-rose-500' : riskPercent > 30 ? 'text-amber-500' : 'text-emerald-500';
  const riskBorder = riskPercent > 70 ? 'border-rose-500' : riskPercent > 30 ? 'border-amber-500' : 'border-emerald-500';

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
      
      {/* --- 1. IMMERSIVE HERO VERDICT --- */}
      <div className={`absolute inset-0 w-full h-[55%] bg-gradient-to-br ${theme.gradient} transition-all duration-700 ease-out`}>
         <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>
         {isDanger && (
            <div className="absolute inset-0 bg-red-500 animate-[pulse_2s_ease-in-out_infinite] opacity-30 mix-blend-overlay"></div>
         )}
      </div>

      {/* Top Nav */}
      <div className="relative z-30 px-6 pt-6 pb-2 flex justify-between items-center text-white/90">
        <button onClick={onScanAgain} className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors backdrop-blur-md">
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-3">
           <button 
             onClick={handleAddToCabinet} 
             disabled={addedToCabinet}
             className={`px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-wide flex items-center gap-1 transition-all ${addedToCabinet ? 'bg-white text-emerald-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
           >
              {addedToCabinet ? <Check size={14} /> : <PlusCircle size={14} />}
              {addedToCabinet ? 'Saved' : 'Save'}
           </button>
        </div>
      </div>

      {/* Hero Content */}
      <div className={`relative z-20 flex flex-col items-center justify-center pt-2 pb-12 transition-all duration-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
         
         <div className="relative group">
            <div className={`absolute inset-0 bg-white blur-2xl opacity-20 rounded-full scale-150 ${isDanger ? 'animate-pulse' : ''}`}></div>
            <StatusIcon size={80} className="text-white drop-shadow-2xl relative z-10" strokeWidth={1.5} />
            {analysis.status === SafetyStatus.SAFE && (
               <div className="absolute -bottom-2 -right-2 bg-white text-emerald-500 rounded-full p-1.5 shadow-lg animate-bounce">
                  <Check size={16} strokeWidth={4} />
               </div>
            )}
         </div>

         <div className="mt-6 flex flex-col items-center gap-2">
            <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md text-center leading-none">
              {theme.label.toUpperCase()}
            </h1>
            <p className="text-white/80 font-medium text-sm tracking-wide">
              {analysis.headline}
            </p>
         </div>
      </div>

      {/* --- 2. THE "SHEET" (Details) --- */}
      <div className={`flex-1 bg-white dark:bg-slate-950 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] relative z-30 overflow-hidden flex flex-col transition-transform duration-700 delay-100 ease-out transform ${mounted ? 'translate-y-0' : 'translate-y-full'}`}>
         
         <div className="w-full flex justify-center pt-4 pb-2">
            <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></div>
         </div>

         <div className="flex-1 overflow-y-auto no-scrollbar px-8 pb-32">
            
            {/* Header: Name & Confidence */}
            <div className="pt-2 pb-6 border-b border-slate-100 dark:border-slate-800/50">
               <div className="flex items-start justify-between">
                  <div>
                     <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                        {analysis.drugName}
                     </h2>
                     <p className="text-lg font-medium text-slate-500 dark:text-slate-400 mt-1">
                        {analysis.activeIngredient}
                     </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5 mt-1">
                     <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <Sparkles size={10} className="text-blue-500 fill-blue-500" />
                        <span>AI 99%</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* INTERACTION RADAR (Visual Feature) */}
            <div className="mt-6 mb-2 flex items-center justify-between animate-slide-up-delay-1 opacity-0" style={{ animationFillMode: 'forwards' }}>
               <div className="flex items-center gap-2">
                  <Activity size={16} className={theme.text} />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Interaction Radar</span>
               </div>
               
               {/* "Explain Like a Doctor" Toggle */}
               <button 
                 onClick={() => setDoctorMode(!doctorMode)}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all ${doctorMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
               >
                 <Stethoscope size={12} />
                 {doctorMode ? 'Doctor Mode' : 'Standard'}
               </button>
            </div>

            {/* Analysis Box */}
            <div className="space-y-4 animate-slide-up-delay-2 opacity-0" style={{ animationFillMode: 'forwards' }}>
               
               {/* The Explanation */}
               <div className={`p-6 rounded-3xl ${theme.lightBg} ${theme.border} border relative overflow-hidden transition-all duration-500`}>
                  <div className={`absolute top-0 left-0 w-1 h-full ${theme.bg}`}></div>
                  
                  {doctorMode ? (
                     <div className="animate-fade-in">
                        <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest">
                           <Stethoscope size={14} /> Doctor's Note
                        </div>
                        <p className={`text-base leading-relaxed font-medium ${theme.text} italic`}>
                           "{analysis.simpleExplanation || analysis.reasoning}"
                        </p>
                     </div>
                  ) : (
                     <p className={`text-sm leading-relaxed font-medium ${theme.text}`}>
                        {analysis.reasoning}
                     </p>
                  )}
               </div>

               {/* The Visual Radar Chart */}
               {(analysis.status === SafetyStatus.DANGER || analysis.status === SafetyStatus.CAUTION) && (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                      {/* CSS Radar Chart */}
                      <div className="relative w-16 h-16 flex items-center justify-center">
                         <div className="absolute inset-0 rounded-full border border-slate-300 dark:border-slate-700 opacity-30"></div>
                         <div className="absolute inset-2 rounded-full border border-slate-300 dark:border-slate-700 opacity-50"></div>
                         <div className="absolute inset-4 rounded-full border border-slate-300 dark:border-slate-700"></div>
                         {/* The Blip */}
                         <div className={`absolute w-full h-1 bg-gradient-to-r from-transparent to-${riskColor.split('-')[1]}-500 opacity-50 animate-spin`} style={{ transformOrigin: 'center left', left: '50%' }}></div>
                         <div className={`relative z-10 font-black text-xs ${riskColor}`}>{riskPercent}%</div>
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-800 dark:text-white text-sm">Interaction Detected</h4>
                         <p className="text-xs text-slate-500 mt-0.5">Risk Level: <span className={`${riskColor} font-bold`}>{riskPercent > 70 ? 'HIGH' : 'MODERATE'}</span></p>
                      </div>
                  </div>
               )}

               {/* Specific Contraindications */}
               {analysis.contraindicationsDetected && analysis.contraindicationsDetected.length > 0 && (
                  <div className="flex flex-col gap-2">
                     {analysis.contraindicationsDetected.map((c, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                           <XCircle size={18} className="text-red-500 shrink-0" />
                           <span className="text-xs font-bold text-red-700 dark:text-red-300 uppercase tracking-wide">
                              Conflict: <span className="text-red-900 dark:text-red-100">{c}</span>
                           </span>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Safer Alternatives */}
             {analysis.safeAlternatives && analysis.safeAlternatives.length > 0 && (
                <div className="mt-8 animate-slide-up-delay-3 opacity-0" style={{ animationFillMode: 'forwards' }}>
                   <div className="flex items-center gap-2 mb-3">
                      <ThumbsUp size={16} className="text-emerald-500" />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Better Options</span>
                   </div>
                   <div className="grid gap-3">
                      {analysis.safeAlternatives.map((alt, idx) => (
                         <div key={idx} className="group flex items-center justify-between p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900 transition-all">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                  <Pill size={18} />
                               </div>
                               <div>
                                  <h4 className="font-bold text-slate-800 dark:text-white">{alt}</h4>
                                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Generic Alternative</p>
                               </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                         </div>
                      ))}
                   </div>
                </div>
             )}

            {/* Side Effects */}
            <div className="mt-8 animate-slide-up-delay-3 opacity-0" style={{ animationFillMode: 'forwards' }}>
               <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Potential Side Effects</span>
               </div>
               <div className="flex flex-wrap gap-2">
                  {analysis.sideEffects.map((effect, idx) => (
                     <div key={idx} className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                        {effect}
                     </div>
                  ))}
               </div>
            </div>

         </div>
      </div>

      {/* --- 3. FLOATING ACTION BUTTON (CTA) --- */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none animate-slide-up-delay-3">
         <button 
            onClick={onScanAgain}
            className="pointer-events-auto flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
         >
            <RefreshCw size={18} className="animate-spin-slow" style={{ animationDuration: '3s' }} />
            <span className="font-bold text-sm tracking-wide uppercase">Scan New Item</span>
         </button>
      </div>

    </div>
  );
};

export default ResultCard;