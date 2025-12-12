import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Zap, Maximize2, Sparkles, Search, ScanLine, Mars, Venus, Mic, MicOff, Barcode, TextCursor, Apple } from 'lucide-react';

interface ScannerProps {
  onScan: (input: string, type: 'image' | 'text', gender?: 'Male' | 'Female') => void;
  isAnalyzing: boolean;
  userName?: string;
  defaultGender?: 'Male' | 'Female' | 'Other';
}

const DAILY_INSIGHTS = [
  { text: "Vitamin C increases Iron absorption by 30%.", type: "Nutrition" },
  { text: "Most headaches come from mild dehydration.", type: "Hydration" },
  { text: "Avoid blue light 1h before bed for better sleep.", type: "Sleep" },
  { text: "Grapefruit can interact with statins.", type: "Safety" },
  { text: "A 10-min walk after meals lowers blood sugar.", type: "Wellness" }
];

type ScanMode = 'label' | 'barcode' | 'food';

const Scanner: React.FC<ScannerProps> = ({ onScan, isAnalyzing, userName = "User", defaultGender = 'Male' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  
  // State
  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female'>((defaultGender === 'Female') ? 'Female' : 'Male');
  const [isListening, setIsListening] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('label');
  
  // Insights Rotation
  const [insightIndex, setInsightIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % DAILY_INSIGHTS.length);
    }, 5000); // Rotate every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeClick = () => {
    if (preview) {
      onScan(preview, 'image', selectedGender);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
        onScan(manualInput, 'text', selectedGender);
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setManualInput(transcript);
      };
      
      recognition.start();
    } else {
      alert("Voice input is not supported in this browser.");
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentInsight = DAILY_INSIGHTS[insightIndex];

  // --- PREVIEW OVERLAY (Active Scan) ---
  if (preview) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fade-in">
        <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        
        {/* Active Scanning Animation Layer */}
        {isAnalyzing ? (
          <div className="absolute inset-0 z-30 bg-blue-900/40 backdrop-blur-[4px]">
            {/* Moving Laser */}
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_50px_rgba(34,211,238,1)] animate-scan-line z-40"></div>
            
            {/* Tech Spinner */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-t-cyan-500 border-r-transparent border-b-cyan-500 border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute w-40 h-40 border border-dashed border-cyan-400/50 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="mt-40 px-6 py-3 bg-black/70 backdrop-blur-md rounded-2xl border border-cyan-500/30 flex flex-col items-center shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                <div className="text-2xl font-black tracking-widest uppercase animate-pulse text-cyan-50">Identifying</div>
                <div className="text-xs text-cyan-300 font-mono mt-1">CROSS-REFERENCING FDA DB...</div>
              </div>
            </div>
          </div>
        ) : (
          /* Static HUD Overlay */
          <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-8 left-8 w-16 h-16 border-t-[6px] border-l-[6px] border-white/90 rounded-tl-3xl drop-shadow-lg"></div>
              <div className="absolute top-8 right-8 w-16 h-16 border-t-[6px] border-r-[6px] border-white/90 rounded-tr-3xl drop-shadow-lg"></div>
              <div className="absolute bottom-8 left-8 w-16 h-16 border-b-[6px] border-l-[6px] border-white/90 rounded-bl-3xl drop-shadow-lg"></div>
              <div className="absolute bottom-8 right-8 w-16 h-16 border-b-[6px] border-r-[6px] border-white/90 rounded-br-3xl drop-shadow-lg"></div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-32 h-32 border-2 border-white/30 rounded-full animate-ping opacity-20"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_20px_rgba(52,211,153,1)]"></div>
              </div>
              
              <div className="absolute top-24 w-full flex justify-center">
                 <div className="px-4 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                    {selectedGender === 'Male' ? <Mars size={12} className="text-blue-400"/> : <Venus size={12} className="text-rose-400"/>}
                    <span className="text-[10px] text-white font-bold uppercase tracking-widest">Analyzing for {selectedGender}</span>
                 </div>
              </div>

              <div className="absolute bottom-24 w-full text-center">
                <div className="inline-block px-5 py-2 bg-black/60 backdrop-blur-md rounded-full border border-emerald-500/30">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Maximize2 size={12} /> Image Locked
                    </p>
                </div>
              </div>
          </div>
        )}

        {!isAnalyzing && (
          <>
            <button 
              onClick={clearImage}
              className="absolute top-6 right-6 bg-black/50 hover:bg-red-500/80 text-white p-3 rounded-full backdrop-blur-md transition-all z-30 pointer-events-auto border border-white/20 active:scale-90"
            >
              <X size={24} />
            </button>
            
            <div className="absolute bottom-10 w-full px-6 pointer-events-auto">
              <button
                onClick={handleAnalyzeClick}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-xl shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-blue-600/50 transform transition-all active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <Zap size={28} className="fill-current animate-[pulse_1s_ease-in-out_infinite]" />
                <span className="tracking-wide">ANALYZE SAFETY</span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // --- DASHBOARD MODE ---
  return (
    <div className="flex flex-col h-full w-full px-6 pt-6 pb-40 overflow-y-auto no-scrollbar relative scroll-smooth bg-slate-50 dark:bg-slate-950">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-blue-500/5 via-indigo-500/5 to-transparent pointer-events-none"></div>

      {/* 1. Header */}
      <div className="mb-8 mt-2 animate-slide-up relative z-10 flex justify-between items-end">
         <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Welcome Back</p>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
               What are we <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">checking today?</span>
            </h1>
         </div>
         {/* User Icon (Placeholder for profile nav if needed) */}
         <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
            <span className="font-bold">{userName.charAt(0)}</span>
         </div>
      </div>

      {/* 2. Premium Search Bar */}
      <div className="relative group z-30 mb-8 animate-slide-up-delay-1">
        <div className={`absolute -inset-[1px] rounded-[2rem] bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm ${isFocused ? 'opacity-100' : ''}`}></div>
        
        <form onSubmit={handleManualSubmit} className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-blue-500/5 dark:shadow-none">
           <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-blue-500' : 'text-slate-400'}`}>
              <Search size={20} />
           </div>
           
           <input 
              type="text" 
              value={manualInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Search for a drug..."}
              className="w-full bg-transparent border-none py-5 pl-14 pr-20 text-base font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-0 outline-none"
           />
           
           {/* Voice Button */}
           <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button 
                   type="button"
                   onClick={startListening}
                   className={`p-3 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-500'}`}
                >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
           </div>
        </form>
      </div>

      {/* 3. Gender Context Switch */}
      <div className="flex flex-col gap-3 mb-8 animate-slide-up-delay-2">
         <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profile Context</span>
         </div>
         <div className="bg-slate-200 dark:bg-slate-900 p-1.5 rounded-2xl flex relative">
            {/* Sliding Background */}
            <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-slate-800 rounded-xl shadow-sm transition-all duration-300 ease-out ${selectedGender === 'Male' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}></div>

            <button 
              onClick={() => setSelectedGender('Male')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-colors duration-300 ${selectedGender === 'Male' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}
            >
              <Mars size={16} className={selectedGender === 'Male' ? 'fill-blue-600/20' : ''} />
              <span className="text-sm font-bold">Male</span>
            </button>
            <button 
              onClick={() => setSelectedGender('Female')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-colors duration-300 ${selectedGender === 'Female' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}
            >
              <Venus size={16} className={selectedGender === 'Female' ? 'fill-rose-600/20' : ''} />
              <span className="text-sm font-bold">Female</span>
            </button>
         </div>
      </div>

      {/* 4. Scan Mode Selector (Cards) */}
      <div className="mb-6 animate-slide-up-delay-2">
          <div className="flex items-center justify-between px-1 mb-3