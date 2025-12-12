import React from 'react';
import { UserProfile } from '../types';
import { QrCode, Phone, ShieldAlert, ArrowLeft } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onBack: () => void;
}

const Emergency: React.FC<Props> = ({ profile, onBack }) => {
  return (
    <div className="h-full w-full bg-rose-600 dark:bg-rose-950 p-6 relative overflow-hidden flex flex-col">
      
      {/* Background Pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/30 rounded-full animate-pulse-slow blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between text-white mb-8">
         <button onClick={onBack} className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors">
            <ArrowLeft size={24} />
         </button>
         <h2 className="text-lg font-black tracking-widest uppercase">Emergency ID</h2>
         <div className="w-10"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl flex-1 flex flex-col items-center animate-slide-up">
         
         <div className="w-20 h-20 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <ShieldAlert size={40} />
         </div>

         <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{profile.name || "Unknown User"}</h1>
         <p className="text-slate-500 font-bold mb-8">Blood Type: O+ (Mock)</p>

         {/* QR Code Placeholder */}
         <div className="w-64 h-64 bg-slate-900 dark:bg-white rounded-3xl p-4 mb-8 flex items-center justify-center shadow-xl">
             <div className="w-full h-full border-4 border-dashed border-white/20 dark:border-slate-900/20 flex flex-col items-center justify-center text-white dark:text-slate-900">
                <QrCode size={100} />
                <p className="text-[10px] font-bold mt-2 uppercase tracking-widest">Scan for Med History</p>
             </div>
         </div>

         {/* Critical Info List */}
         <div className="w-full space-y-4">
            <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30">
               <p className="text-xs font-bold text-rose-500 uppercase mb-1">Critical Conditions</p>
               <p className="font-bold text-slate-800 dark:text-white">
                  {profile.conditions.length > 0 ? profile.conditions.join(", ") : "None Listed"}
               </p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30">
               <p className="text-xs font-bold text-rose-500 uppercase mb-1">Severe Allergies</p>
               <p className="font-bold text-slate-800 dark:text-white">
                  {profile.allergies.length > 0 ? profile.allergies.join(", ") : "None Listed"}
               </p>
            </div>
         </div>

         {/* Call Button */}
         <button className="w-full mt-auto py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all">
            <Phone size={20} />
            <span>Call Emergency Services</span>
         </button>

      </div>
    </div>
  );
};

export default Emergency;