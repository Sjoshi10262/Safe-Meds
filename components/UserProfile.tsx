import React, { useState, useEffect, useRef } from 'react';
import { UserProfile as UserProfileType } from '../types';
import { 
  Plus, Edit2, Trash2, X, Check, Smile, User, Heart, 
  Baby, Star, Zap, Crown, Ghost, ChevronLeft, Camera, Palette,
  Activity, ShieldAlert, Pill, CheckCircle2
} from 'lucide-react';

// --- Types & Props ---

interface Props {
  profiles: UserProfileType[];
  activeProfileId: string;
  onSwitchProfile: (id: string) => void;
  onAddProfile: (profile: UserProfileType) => void;
  onSave: (profile: UserProfileType) => void;
  onDelete?: (id: string) => void; 
}

// --- Icons & Themes ---

const AVATAR_ICONS = [
  { id: 'smile', icon: Smile, label: 'Classic' },
  { id: 'user', icon: User, label: 'Minimal' },
  { id: 'heart', icon: Heart, label: 'Care' },
  { id: 'baby', icon: Baby, label: 'Child' },
  { id: 'star', icon: Star, label: 'Star' },
  { id: 'zap', icon: Zap, label: 'Energy' },
  { id: 'crown', icon: Crown, label: 'VIP' },
  { id: 'ghost', icon: Ghost, label: 'Privacy' },
];

const THEME_COLORS = [
  'bg-gradient-to-br from-blue-500 to-indigo-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-rose-500 to-red-600',
  'bg-gradient-to-br from-amber-500 to-orange-600',
  'bg-gradient-to-br from-purple-500 to-violet-600',
  'bg-gradient-to-br from-slate-700 to-slate-900',
];

// --- Toast Component ---

const Toast = ({ message, show, onClose }: { message: string, show: boolean, onClose: () => void }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm">
        <CheckCircle2 size={18} className="text-white" />
        {message}
      </div>
    </div>
  );
};

// --- Sub-Components ---

const ProfileCard = ({ profile, isEditing, onClick, onEdit }: any) => {
  const Icon = AVATAR_ICONS.find(a => a.id === profile.avatar)?.icon || User;
  
  return (
    <div className="flex flex-col items-center group cursor-pointer animate-fade-in" onClick={isEditing ? onEdit : onClick}>
      <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4 rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-105 shadow-2xl">
         {/* Avatar Background */}
         <div className={`absolute inset-0 ${profile.themeColor || THEME_COLORS[0]}`}></div>
         
         {/* Icon */}
         <div className="absolute inset-0 flex items-center justify-center text-white">
            <Icon size={48} strokeWidth={1.5} />
         </div>
         
         {/* Edit Overlay */}
         {isEditing && (
           <div className="absolute inset-0 bg-black/60 flex items-center justify-center animate-fade-in backdrop-blur-[2px]">
              <Edit2 className="text-white w-8 h-8" />
           </div>
         )}
         
         {/* Active Ring (if not editing) */}
         {!isEditing && (
           <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/50 transition-colors"></div>
         )}
      </div>
      
      <span className="text-slate-400 group-hover:text-white font-medium text-lg transition-colors text-center">
        {profile.name}
      </span>
    </div>
  );
};

const AddProfileCard = ({ onClick }: { onClick: () => void }) => (
  <div className="flex flex-col items-center group cursor-pointer animate-fade-in" onClick={onClick}>
    <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4 flex items-center justify-center rounded-2xl bg-[#1f1f1f] border-2 border-dashed border-slate-700 group-hover:border-slate-400 group-hover:bg-[#2a2a2a] transition-all duration-300 group-hover:scale-105">
       <Plus size={32} className="text-slate-500 group-hover:text-slate-200" />
    </div>
    <span className="text-slate-500 group-hover:text-slate-300 font-medium text-lg transition-colors text-center">
      Add Profile
    </span>
  </div>
);

// --- Theme List Input (e.g. Allergies) ---

const ThemeListInput = ({ label, items, onChange, icon: Icon, accentColor, placeholder }: any) => {
  const [val, setVal] = useState('');
  const colors = {
    blue: 'text-blue-500 focus-within:border-blue-500',
    rose: 'text-rose-500 focus-within:border-rose-500',
    emerald: 'text-emerald-500 focus-within:border-emerald-500'
  }[accentColor as string] || 'text-blue-500';

  const add = () => { 
    if(val.trim() && !items.includes(val.trim())){ 
      onChange([...items, val.trim()]); 
      setVal(''); 
    }
  };

  const remove = (idx: number) => {
    onChange(items.filter((_: any, i: number) => i !== idx));
  };

  return (
    <div className="space-y-3 pt-2">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <Icon size={14} className={colors.split(' ')[0]} />
        {label}
      </label>
      
      <div className={`flex items-center bg-slate-900 border border-slate-700 rounded-xl transition-all ${colors}`}>
         <div className="pl-4 pr-2 opacity-50"><Icon size={16} /></div>
         <input 
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            className="flex-1 bg-transparent border-none text-white text-sm py-3 focus:ring-0 placeholder:text-slate-600 font-medium"
            placeholder={placeholder}
         />
         <button type="button" onClick={add} disabled={!val.trim()} className="p-2 mr-1 text-slate-400 hover:text-white disabled:opacity-30">
           <Plus size={18} />
         </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item: string, idx: number) => (
          <div key={idx} className="pl-3 pr-2 py-1 rounded-lg border border-slate-700 bg-slate-800/50 flex items-center gap-2 animate-fade-in">
             <span className="text-xs font-bold text-slate-300">{item}</span>
             <button onClick={() => remove(idx)} className="text-slate-500 hover:text-rose-500"><X size={12} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Editor Overlay ---

const ProfileEditor = ({ profile, isNew, onSave, onCancel, onDelete }: any) => {
  const [formData, setFormData] = useState<UserProfileType>(profile);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize form state if profile changes (though usually component remounts)
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f10] flex flex-col animate-slide-up">
      {/* Header */}
      <div className="shrink-0 h-16 px-6 flex items-center justify-between border-b border-white/10 bg-[#0f0f10]/80 backdrop-blur-md sticky top-0 z-20">
         <button onClick={onCancel} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={24} />
         </button>
         <h2 className="text-lg font-bold text-white tracking-wide">
            {isNew ? 'Create Profile' : 'Edit Profile'}
         </h2>
         <div className="w-8"></div> {/* Spacer */}
      </div>

      {/* Scrollable Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-6 pb-32">
        <div className="max-w-2xl mx-auto">
          
          {/* Avatar & Theme */}
          <div className="flex flex-col items-center gap-6 mb-10">
             <div className={`w-32 h-32 rounded-3xl flex items-center justify-center text-white shadow-2xl relative overflow-hidden transition-all duration-500 ${formData.themeColor}`}>
                {React.createElement(AVATAR_ICONS.find(a => a.id === formData.avatar)?.icon || User, { size: 64 })}
             </div>

             {/* Selectors */}
             <div className="w-full space-y-6 bg-[#18181b] p-6 rounded-2xl border border-white/5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-3 block flex items-center gap-2"><Camera size={12}/> Choose Avatar</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {AVATAR_ICONS.map((icon) => (
                      <button 
                        key={icon.id}
                        onClick={() => setFormData({...formData, avatar: icon.id})}
                        className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${formData.avatar === icon.id ? 'bg-white text-black scale-110' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                      >
                        <icon.icon size={24} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-3 block flex items-center gap-2"><Palette size={12}/> Color Theme</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {THEME_COLORS.map((color, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setFormData({...formData, themeColor: color})}
                        className={`shrink-0 w-10 h-10 rounded-full ${color} ${formData.themeColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-40 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                </div>
             </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
             <div className="bg-[#18181b] p-6 rounded-2xl border border-white/5 space-y-4">
                <div>
                   <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Name</label>
                   <input 
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                     className="w-full bg-[#0f0f10] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                     placeholder="Profile Name"
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Age</label>
                     <input 
                       type="number"
                       value={formData.age}
                       onChange={e => setFormData({...formData, age: Number(e.target.value)})}
                       className="w-full bg-[#0f0f10] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                     />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">Gender</label>
                     <select 
                       value={formData.gender}
                       onChange={e => setFormData({...formData, gender: e.target.value as any})}
                       className="w-full bg-[#0f0f10] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors appearance-none"
                     >
                       <option value="Male">Male</option>
                       <option value="Female">Female</option>
                       <option value="Other">Other</option>
                     </select>
                   </div>
                </div>
             </div>

             <div className="bg-[#18181b] p-6 rounded-2xl border border-white/5 space-y-6">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Medical Profile</h3>
                <ThemeListInput 
                   label="Conditions" items={formData.conditions} onChange={(c: any) => setFormData({...formData, conditions: c})} 
                   icon={Activity} accentColor="blue" placeholder="Add condition..."
                />
                <ThemeListInput 
                   label="Allergies" items={formData.allergies} onChange={(c: any) => setFormData({...formData, allergies: c})} 
                   icon={ShieldAlert} accentColor="rose" placeholder="Add allergy..."
                />
                <ThemeListInput 
                   label="Current Meds" items={formData.currentMeds} onChange={(c: any) => setFormData({...formData, currentMeds: c})} 
                   icon={Pill} accentColor="emerald" placeholder="Add medication..."
                />
             </div>
             
             {/* Delete Option */}
             {!isNew && onDelete && (
                <button 
                  onClick={onDelete}
                  className="w-full py-4 rounded-xl border border-rose-900/30 text-rose-500 font-bold text-sm hover:bg-rose-900/10 transition-colors flex items-center justify-center gap-2"
                >
                   <Trash2 size={16} /> Delete Profile
                </button>
             )}
          </div>
        </div>
      </div>

      {/* Sticky Footer Actions */}
      <div className="shrink-0 p-6 bg-[#0f0f10]/90 backdrop-blur-xl border-t border-white/10 sticky bottom-0 z-50 flex gap-4">
         <button onClick={onCancel} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-colors">
            Cancel
         </button>
         <button onClick={() => onSave(formData)} className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25 text-white font-bold rounded-2xl transition-all active:scale-[0.98]">
            Save Changes
         </button>
      </div>
    </div>
  );
};

// --- Main Profile Selector ---

const UserProfile: React.FC<Props> = ({ profiles, activeProfileId, onSwitchProfile, onAddProfile, onSave, onDelete }) => {
  const [view, setView] = useState<'GRID' | 'EDIT'>('GRID');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleProfileClick = (id: string) => {
     // In standard mode, just switch
     onSwitchProfile(id);
  };

  const handleEditClick = (e: React.MouseEvent, id: string) => {
     e.stopPropagation();
     setEditingId(id);
     setView('EDIT');
  }

  const handleStartAdd = () => {
    setEditingId(null);
    setView('EDIT');
  }

  const handleSaveAction = (p: UserProfileType) => {
    if (!p.name.trim()) return;
    
    // Save logic
    if (editingId) {
       onSave(p);
       setShowToast(true);
    } else {
       onAddProfile(p);
       setShowToast(true);
    }

    // Close Modal
    setView('GRID');
    setEditingId(null);
  };

  const handleDeleteAction = () => {
    if (editingId && onDelete) onDelete(editingId);
    setView('GRID');
    setEditingId(null);
  };

  // Determine profile to edit
  const profileToEdit = editingId 
    ? profiles.find(p => p.id === editingId) 
    : {
        id: Date.now().toString(),
        name: '',
        relation: 'Me',
        avatar: 'smile',
        themeColor: THEME_COLORS[0],
        age: 30,
        gender: 'Male',
        conditions: [],
        allergies: [],
        currentMeds: []
      } as UserProfileType;

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white font-sans relative">
      <Toast message="Profile updated successfully ❤️" show={showToast} onClose={() => setShowToast(false)} />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-blue-900/10 to-transparent"></div>
      </div>

      {view === 'EDIT' ? (
        <ProfileEditor 
          profile={profileToEdit}
          isNew={!editingId}
          onSave={handleSaveAction}
          onCancel={() => setView('GRID')}
          onDelete={editingId ? handleDeleteAction : undefined}
        />
      ) : (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in">
           <h1 className="text-3xl md:text-5xl font-light tracking-tight mb-12 text-center text-white/90">
             Who is checking meds?
           </h1>

           <div className="flex flex-wrap justify-center gap-8 md:gap-12 max-w-5xl">
              {profiles.map(p => (
                <div key={p.id} className="relative group">
                  <ProfileCard 
                     profile={p}
                     onClick={() => handleProfileClick(p.id)}
                     onEdit={() => {}} // handled via absolute button below for clearer UX on mobile
                  />
                  {/* Edit Pencil (Float) */}
                  <button 
                    onClick={(e) => handleEditClick(e, p.id)}
                    className="absolute -top-2 -right-2 bg-slate-800 text-slate-400 p-2 rounded-full border border-slate-700 shadow-lg hover:text-white hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Edit Profile"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              ))}
              
              {profiles.length < 5 && (
                <AddProfileCard onClick={handleStartAdd} />
              )}
           </div>
           
           <div className="mt-20">
              <button 
                 onClick={() => setView('EDIT')} // Open 'Add' basically, or toggle a manage mode if we wanted
                 className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-[0.2em] transition-colors"
              >
                Manage Profiles
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;