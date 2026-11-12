import React, { useState, useRef } from 'react';
import {
  User,
  Camera,
  Check,
  X,
  Sparkles,
  Upload,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { USER_AVATARS, UserAvatarOption, getUserAvatarUrl } from '../../data/userAvatars';

interface FirstTimeProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: {
    displayName: string;
    username: string;
    avatar: string | null;
  }) => Promise<{ success: boolean; error?: string } | void> | void;
}

export const FirstTimeProfileSetupModal: React.FC<FirstTimeProfileSetupModalProps> = ({
  isOpen,
  onClose,
  onSaveProfile,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [customUploadedAvatars, setCustomUploadedAvatars] = useState<UserAvatarOption[]>(() => {
    try {
      const saved = localStorage.getItem('debatex_uploaded_avatars');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64Data = reader.result;
        const newAvatar: UserAvatarOption = {
          id: `custom-upload-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, '').slice(0, 16) || 'My Upload',
          tagline: 'Custom Uploaded Photo',
          styleDescription: 'User uploaded image',
          url: base64Data,
        };
        const updated = [newAvatar, ...customUploadedAvatars];
        setCustomUploadedAvatars(updated);
        try {
          localStorage.setItem('debatex_uploaded_avatars', JSON.stringify(updated));
        } catch (err) {}
        setSelectedAvatar(newAvatar.id);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    const cleanUsername = username.trim().toLowerCase().replace(/[\s\t\n]+/g, '_');
    const cleanDisplay = displayName.trim();

    try {
      const result = await onSaveProfile({
        displayName: cleanDisplay,
        username: cleanUsername,
        avatar: selectedAvatar ? selectedAvatar : null,
      });

      if (result && result.error) {
        setError(result.error);
        setIsSaving(false);
        return;
      }

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentPreviewUrl = selectedAvatar
    ? getUserAvatarUrl(selectedAvatar, customUploadedAvatars)
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#090e21] border border-[#232f5a] shadow-[0_0_50px_rgba(147,51,234,0.3)] p-6 sm:p-8 text-white space-y-6">
        {/* Top Close Button (Explore First without saving) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title="Explore first without saving"
          aria-label="Close setup and explore"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Welcoming Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/40 text-purple-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Welcome to DebateX</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Set Up Your Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Create your debate persona. You can choose a picture, display name, and username now, or explore the arena first and finish anytime.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Empty Profile Picture Circular Placeholder & Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-200 block text-center">
            Profile Picture <span className="font-normal text-slate-400">(Optional - choose or upload)</span>
          </label>

          <div className="flex flex-col items-center justify-center gap-3">
            {/* Circular Profile Placeholder */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 p-[2px] shadow-[0_0_20px_rgba(168,85,247,0.35)]">
                <div className="w-full h-full rounded-full bg-[#070b1a] overflow-hidden flex items-center justify-center">
                  {currentPreviewUrl ? (
                    <img
                      src={currentPreviewUrl}
                      alt="Selected Avatar"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* Blank circular placeholder */
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <User className="w-10 h-10 stroke-[1.5]" />
                      <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Empty</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload action button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-[#0e1633] text-cyan-400 hover:text-white border border-[#22305e] hover:border-cyan-400 shadow-md transition-all cursor-pointer"
                title="Upload image from device"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {selectedAvatar && (
              <button
                type="button"
                onClick={() => setSelectedAvatar('')}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors underline cursor-pointer"
              >
                Remove selection (keep blank)
              </button>
            )}
          </div>

          {/* Avatar Options Picker */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Choose from 12 Illustrated Styles:</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Custom</span>
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1.5 rounded-2xl bg-[#060913] border border-[#1b254a]">
              {USER_AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.id || selectedAvatar === av.url;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer group ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-500/50 shadow-md'
                        : 'border-slate-800 hover:border-slate-600 opacity-75 hover:opacity-100'
                    }`}
                    title={av.name}
                  >
                    <img
                      src={av.url}
                      alt={av.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Display Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
            <span>Display Name</span>
            <span className="text-[11px] text-slate-400 font-normal">How others see you in debates</span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter preferred display name (e.g. Alex Vance)"
            className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[#060913] border border-[#1b254a] text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
          />
        </div>

        {/* 3. Unique Username Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
            <span>Unique Username</span>
            <span className="text-[11px] text-slate-400 font-normal">Your unique handle</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 font-mono text-xs font-bold select-none">
              @
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="choose_username (e.g. debater_one)"
              className="w-full pl-8 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[#060913] border border-[#1b254a] text-white focus:outline-none focus:border-cyan-400 font-mono placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Action Buttons: Save Profile + Explore First */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#1b254a]">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all cursor-pointer order-2 sm:order-1 text-center"
          >
            Explore First (Skip for now)
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-[#d946ef] via-[#8b5cf6] to-[#06b6d4] hover:from-[#c026d3] hover:to-[#0891b2] text-white font-bold text-xs shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 order-1 sm:order-2 active:scale-95 disabled:opacity-50"
          >
            <span>Save Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
