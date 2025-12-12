import React, { useState, useEffect } from 'react';
import { AppView, UserProfile as UserProfileType, DrugAnalysis, SafetyStatus } from './types';
import Scanner from './components/Scanner';
import UserProfile from './components/UserProfile';
import ResultCard from './components/ResultCard';
import Cabinet from './components/Cabinet';
import Emergency from './components/Emergency';
import Auth from './components/Auth';
import IntroAnimation from './components/IntroAnimation';
import { analyzeDrugImage, analyzeDrugText } from './services/geminiService';
import { Pill, User, History, Home, HeartPulse, Moon, Sun, ArrowRight, Sparkles, ShieldAlert, LogOut, Package } from 'lucide-react';

const INITIAL_PROFILE: UserProfileType = {
  id: 'me',
  name: 'My Profile',
  relation: 'Me',
  avatar: 'smile',
  themeColor: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  age: 30,
  gender: 'Male',
  conditions: [],
  allergies: [],
  currentMeds: []
};

// Wrapper for view transitions
const PageTransition = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <div className={`animate-slide-up w-full h-full flex flex-col relative ${className}`}>
    {children}
  </div>
);

function App() {
  const [view, setView] = useState<AppView>(AppView.INTRO); // Start with INTRO
  
  // Profile State
  const [profiles, setProfiles] = useState<UserProfileType[]>([INITIAL_PROFILE]);
  const [activeProfileId, setActiveProfileId] = useState<string>('me');

  const [currentAnalysis, setCurrentAnalysis] = useState<DrugAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<DrugAnalysis[]>([]);
  const [cabinet, setCabinet] = useState<DrugAnalysis[]>([]);
  const [darkMode, setDarkMode] = useState(true);

  // Computed active profile
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Load Profiles
    const savedProfiles = localStorage.getItem('safeMeds_profiles');
    if (savedProfiles) {
      try {
        setProfiles(JSON.parse(savedProfiles));
      } catch (e) { console.error("Failed to parse profiles", e); }
    }
    const savedActiveId = localStorage.getItem('safeMeds_activeProfileId');
    if (savedActiveId) {
      setActiveProfileId(savedActiveId);
    }

    const savedHistory = localStorage.getItem('safeMeds_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedCabinet = localStorage.getItem('safeMeds_cabinet');
    if (savedCabinet) setCabinet(JSON.parse(savedCabinet));
  }, []);

  const handleIntroComplete = () => {
    // Logic: If user has local storage data (profiles), go to Profile Selector.
    // If brand new, go to Onboarding.
    const hasProfiles = localStorage.getItem('safeMeds_profiles');
    if (hasProfiles) {
      setView(AppView.PROFILE);
    } else {
      setView(AppView.ONBOARDING);
    }
  };

  const handleAuthSuccess = (isNewUser: boolean) => {
    if (isNewUser) {
      // For new users, we might want to edit the default profile or just go to grid
      setView(AppView.PROFILE);
    } else {
      setView(AppView.PROFILE);
    }
  };

  const handleProfileSave = (updatedProfile: UserProfileType) => {
    setProfiles(prevProfiles => {
      const exists = prevProfiles.some(p => p.id === updatedProfile.id);
      let newProfiles;
      
      if (exists) {
        newProfiles = prevProfiles.map(p => p.id === updatedProfile.id ? updatedProfile : p);
      } else {
        newProfiles = [...prevProfiles, updatedProfile];
      }
      
      // Persist immediately
      localStorage.setItem('safeMeds_profiles', JSON.stringify(newProfiles));
      return newProfiles;
    });
  };

  const handleAddProfile = (newProfile: UserProfileType) => {
    setProfiles(prevProfiles => {
      const newProfiles = [...prevProfiles, newProfile];
      localStorage.setItem('safeMeds_profiles', JSON.stringify(newProfiles));
      return newProfiles;
    });
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles(prevProfiles => {
      const newProfiles = prevProfiles.filter(p => p.id !== id);
      localStorage.setItem('safeMeds_profiles', JSON.stringify(newProfiles));
      
      // If active profile was deleted, reset to first available or default
      if (id === activeProfileId) {
        const nextId = newProfiles.length > 0 ? newProfiles[0].id : '';
        setActiveProfileId(nextId);
        if(nextId) localStorage.setItem('safeMeds_activeProfileId', nextId);
      }
      
      return newProfiles;
    });
  };

  const handleSwitchProfile = (id: string) => {
    setActiveProfileId(id);
    localStorage.setItem('safeMeds_activeProfileId', id);
    // After selecting profile in "Netflix" screen, go to Main App (Scan)
    setView(AppView.SCAN);
  };

  const handleScan = async (input: string, type: 'image' | 'text' = 'image', genderOverride?: 'Male' | 'Female') => {
    setIsAnalyzing(true);
    
    // Determine the profile context to use
    // If the scanner gender selection differs from profile, create a temporary context
    const profileToUse = (genderOverride && genderOverride !== activeProfile.gender) 
      ? { ...activeProfile, gender: genderOverride } 
      : activeProfile;

    setTimeout(async () => {
      let result;
      if (type === 'image') {
        result = await analyzeDrugImage(input, profileToUse);
      } else {
        result = await analyzeDrugText(input, profileToUse);
      }
      
      setCurrentAnalysis(result);
      
      const newHistory = [result, ...history].slice(0, 20);
      setHistory(newHistory);
      localStorage.setItem('safeMeds_history', JSON.stringify(newHistory));
      
      setIsAnalyzing(false);
      setView(AppView.RESULT);
    }, 100);
  };

  const handleAddToCabinet = (med: DrugAnalysis) => {
    const exists = cabinet.some(m => m.drugName === med.drugName && m.activeIngredient === med.activeIngredient);
    if (!exists) {
       const newCabinet = [med, ...cabinet];
       setCabinet(newCabinet);
       localStorage.setItem('safeMeds_cabinet', JSON.stringify(newCabinet));
    }
  };

  const handleRemoveFromCabinet = (timestamp: number) => {
    const newCabinet = cabinet.filter(m => m.timestamp !== timestamp);
    setCabinet(newCabinet);
    localStorage.setItem('safeMeds_cabinet', JSON.stringify(newCabinet));
  };

  const handleLogout = () => {
    // Reset to Intro on logout to show premium feel again
    setView(AppView.INTRO);
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  const renderContent = () => {
    switch (view) {
      case AppView.INTRO:
        return <IntroAnimation onComplete={handleIntroComplete} />;

      case AppView.ONBOARDING:
        return (
          <PageTransition className="overflow-y-auto no-scrollbar scroll-smooth">
            <div className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center pt-20 pb-10">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob dark:opacity-10 dark:mix-blend-screen"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 animate-blob animation-delay-2000 dark:opacity-10 dark:mix-blend-screen"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob animation-delay-4000 dark:opacity-5 dark:mix-blend-screen"></div>

              <div className="relative mb-8 group cursor-default">
                 <div className="absolute inset-0 bg-blue-500 rounded-[2.5rem] animate-ping opacity-20"></div>
                 <div className="relative w-28 h-28 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_60px_-15px_rgba(37,99,235,0.6)] border border-white/10 z-20 group-hover:scale-105 transition-transform duration-500">
                   <HeartPulse size={48} className="text-white drop-shadow-lg" />
                 </div>
                 <div className="absolute inset-[-15px] rounded-full border border-dashed border-slate-300 dark:border-slate-700/50 animate-[spin_10s_linear_infinite]"></div>
              </div>
              
              <h1 className="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-[0.9] drop-shadow-sm max-w-3xl">
                The Personal <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-gradient-x">AI Pharmacist</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-xl mx-auto mb-10">
                Instantly identify medications and check for safety risks against your specific health profile.
              </p>

              <div className="fixed bottom-6 left-0 w-full px-6 flex justify-center z-50 pointer-events-none">
                <button 
                  onClick={() => setView(AppView.AUTH)}
                  className="pointer-events-auto group relative w-full max-w-sm overflow-hidden rounded-[2rem] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-x"></div>
                  <div className="relative bg-slate-900 dark:bg-white m-[2px] rounded-[1.9rem] py-4 px-8 flex items-center justify-between transition-colors">
                    <span className="font-bold text-lg text-white dark:text-slate-900 tracking-wide">
                      Get Started
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-slate-900/10 text-white dark:text-slate-900 flex items-center justify-center">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </PageTransition>
        );

      case AppView.AUTH:
        return (
          <PageTransition>
            <Auth onAuthSuccess={handleAuthSuccess} onBack={() => setView(AppView.ONBOARDING)} />
          </PageTransition>
        );
      
      case AppView.PROFILE:
        return (
          <UserProfile 
            profiles={profiles} 
            activeProfileId={activeProfileId}
            onSwitchProfile={handleSwitchProfile}
            onAddProfile={handleAddProfile}
            onSave={handleProfileSave}
            onDelete={handleDeleteProfile}
          />
        );
      
      case AppView.SCAN:
        return (
          <PageTransition>
            <Scanner 
              userName={activeProfile.name} 
              defaultGender={activeProfile.gender as 'Male' | 'Female' | 'Other'}
              onScan={handleScan} 
              isAnalyzing={isAnalyzing} 
            />
          </PageTransition>
        );
      
      case AppView.RESULT:
        return currentAnalysis ? (
          <PageTransition>
             <ResultCard 
               analysis={currentAnalysis} 
               onScanAgain={() => setView(AppView.SCAN)} 
               onAddToCabinet={handleAddToCabinet}
             />
          </PageTransition>
        ) : <div>Error</div>;

      case AppView.CABINET:
        return (
          <PageTransition>
             <Cabinet 
               medications={cabinet} 
               onRemove={handleRemoveFromCabinet} 
               onView={(med) => { setCurrentAnalysis(med); setView(AppView.RESULT); }} 
               onScan={() => setView(AppView.SCAN)}
             />
          </PageTransition>
        );
      
      case AppView.EMERGENCY:
        return (
          <PageTransition>
             <Emergency profile={activeProfile} onBack={() => setView(AppView.SCAN)} />
          </PageTransition>
        );
        
      case AppView.HISTORY:
        return (
            <PageTransition>
              <div className="p-6 pb-32 h-full overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between mb-8 pt-2 animate-slide-up">
                   <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Timeline</h2>
                   <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                      <Sparkles size={12} className="text-amber-500" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{history.length} Scans</span>
                   </div>
                </div>
                {history.map((item, idx) => (
                  <div key={idx} onClick={() => { setCurrentAnalysis(item); setView(AppView.RESULT); }} className="group bg-white dark:bg-slate-900/60 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.status === 'SAFE' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                           <Pill size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-white">{item.drugName}</h3>
                          <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                  </div>
                ))}
              </div>
          </PageTransition>
        )
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col relative font-sans text-base">
      <div className="fixed inset-0 z-[-1] animate-gradient-x bg-gradient-to-br from-blue-50 via-indigo-50 to-emerald-50 dark:from-slate-950 dark:via-[#0a0f2e] dark:to-[#021815] transition-colors duration-1000"></div>
      
      {/* Top Navbar - Only show in main app views */}
      {view !== AppView.INTRO && view !== AppView.ONBOARDING && view !== AppView.AUTH && view !== AppView.PROFILE && view !== AppView.RESULT && view !== AppView.EMERGENCY && (
         <div className="h-[10vh] min-h-[60px] max-h-[80px] px-6 flex items-center justify-between z-40 animate-slide-up shrink-0">
           <div className="flex items-center gap-2">
              <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center rounded-full glass-card border border-white/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all hover:scale-110 active:scale-95">
                 <LogOut size={18} />
              </button>
           </div>
           
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setView(AppView.EMERGENCY)} 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse-slow hover:scale-110 active:scale-95 transition-transform"
              >
                 <ShieldAlert size={18} />
              </button>

              <button 
                onClick={toggleTheme} 
                className="w-10 h-10 flex items-center justify-center rounded-full glass-card border border-white/10 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-all hover:scale-110 active:scale-95"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              
              <button 
                onClick={() => setView(AppView.PROFILE)} 
                className="w-10 h-10 flex items-center justify-center rounded-full glass-card border border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-all hover:scale-110 active:scale-95 relative overflow-hidden"
              >
                 {/* Show active user avatar here tiny */}
                 <div className={`absolute inset-0 opacity-50 ${activeProfile.themeColor}`}></div>
                 <span className="relative z-10 font-bold text-xs">{activeProfile.name.charAt(0)}</span>
              </button>
           </div>
         </div>
      )}

      <div className="flex-1 flex flex-col relative z-0 min-h-0">
        {renderContent()}
      </div>

      {(view === AppView.SCAN || view === AppView.HISTORY || view === AppView.CABINET) && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up-delay-2 w-full flex justify-center pointer-events-none">
          <div className="glass-card p-1.5 rounded-full flex gap-1 shadow-[0_10px_30px_rgba(0,0,0,0.2)] border border-white/20 pointer-events-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <NavButton active={view === AppView.SCAN} icon={<Home size={20} />} label="Scan" onClick={() => setView(AppView.SCAN)} />
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 self-center mx-1"></div>
            <NavButton active={view === AppView.CABINET} icon={<Package size={20} />} label="Cabinet" onClick={() => setView(AppView.CABINET)} />
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 self-center mx-1"></div>
            <NavButton active={view === AppView.HISTORY} icon={<History size={20} />} label="Timeline" onClick={() => setView(AppView.HISTORY)} />
          </div>
        </div>
      )}
    </div>
  );
}

const NavButton = ({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 overflow-hidden group ${active ? 'text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
  >
    {active && <div className="absolute inset-0 bg-slate-900 dark:bg-blue-600 rounded-full animate-fade-in shadow-md"></div>}
    <span className="relative z-10 flex items-center gap-2">
      {React.cloneElement(icon as React.ReactElement, { className: active ? "text-white" : "group-hover:scale-110 transition-transform" })}
      {active && <span className="text-sm font-bold whitespace-nowrap">{label}</span>}
    </span>
  </button>
);

export default App;