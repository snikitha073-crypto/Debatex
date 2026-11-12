import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Camera,
  Save,
  Check,
  Trophy,
  Award,
  History,
  Calendar,
  MessageSquare,
  UserPlus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Plus,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { UserStats, PastDebate } from '../../types/debate';
import {
  USER_AVATARS,
  UserAvatarOption,
  getUserAvatarUrl,
} from '../../data/userAvatars';

interface ProfileViewProps {
  currentUser: {
    username: string;
    displayName: string;
    avatar: string | null;
    bio: string;
  };
  userStats: UserStats;
  debates: PastDebate[];
  onUpdateProfile: (updated: {
    displayName: string;
    bio: string;
    avatar: string | null;
    username?: string;
  }) => Promise<{ success: boolean; error?: string } | void> | void;
  onUpdateUsername?: (newUsername: string) => Promise<{ success: boolean; error?: string } | void>;
  onOpenTranscript: (debate: PastDebate) => void;
  onOpenAuthModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  userStats,
  debates,
  onUpdateProfile,
  onUpdateUsername,
  onOpenTranscript,
  onOpenAuthModal,
}) => {
  // Independent input states
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState<string | null>(currentUser.avatar || null);

  // Uploaded avatars state (empty by default; only stores real user-uploaded avatars)
  const [uploadedAvatars, setUploadedAvatars] = useState<UserAvatarOption[]>(() => {
    try {
      const saved = localStorage.getItem('debatex_uploaded_avatars');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Strictly filter out any reference images so they never appear as avatar options
          return parsed.filter(
            (p: any) =>
              p &&
              p.url &&
              !p.url.includes('image_66548694') &&
              !p.url.includes('image_be2e9847') &&
              !p.id?.includes('uploaded-bloom') &&
              !p.id?.includes('uploaded-shadow')
          );
        }
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  // Status feedback states
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [usernameSaveSuccess, setUsernameSaveSuccess] = useState(false);
  const [usernameSaveError, setUsernameSaveError] = useState<string | null>(null);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync inputs when currentUser changes from outside (e.g. login/switch)
  useEffect(() => {
    setUsername(currentUser.username);
  }, [currentUser.username]);

  useEffect(() => {
    setDisplayName(currentUser.displayName);
  }, [currentUser.displayName]);

  useEffect(() => {
    setBio(currentUser.bio || '');
  }, [currentUser.bio]);

  useEffect(() => {
    setAvatar(currentUser.avatar);
  }, [currentUser.avatar]);

  // Upload image from user's device and add to "My Uploaded Avatars"
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileSaveError('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64Data = reader.result;
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').slice(0, 16) || 'My Avatar';

        const newAvatarOption: UserAvatarOption = {
          id: `custom-uploaded-${Date.now()}`,
          name: cleanTitle,
          tagline: 'Custom Uploaded Image',
          styleDescription: 'User uploaded custom avatar image',
          url: base64Data,
        };

        const updatedList = [newAvatarOption, ...uploadedAvatars];
        setUploadedAvatars(updatedList);
        try {
          localStorage.setItem('debatex_uploaded_avatars', JSON.stringify(updatedList));
        } catch (err) {
          // ignore
        }

        // Select the newly uploaded avatar immediately
        setAvatar(newAvatarOption.id);
        onUpdateProfile({
          displayName: displayName.trim(),
          bio: bio.trim(),
          avatar: newAvatarOption.id,
          username: currentUser.username,
        });

        setProfileSaveSuccess(true);
        setTimeout(() => setProfileSaveSuccess(false), 2500);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so the same file can be selected again if desired
    e.target.value = '';
  };

  // Helper to validate and sanitize username
  const sanitizeUsername = (raw: string): { clean: string; error?: string } => {
    const clean = raw.trim().toLowerCase().replace(/[\s\t\n]+/g, '_');
    if (!clean) {
      return { clean: '', error: 'Username cannot be empty. Please enter a valid username.' };
    }
    if (clean.length < 2) {
      return { clean, error: 'Username must be at least 2 characters long.' };
    }
    if (!/^[a-z0-9_-]+$/.test(clean)) {
      return { clean, error: 'Username can only contain letters, numbers, underscores (_), and hyphens (-).' };
    }
    return { clean };
  };

  // Explicit Save option specifically for the Username
  const handleSaveUsernameOnly = async () => {
    setUsernameSaveError(null);
    setUsernameSaveSuccess(false);

    const validation = sanitizeUsername(username);
    if (validation.error) {
      setUsernameSaveError(validation.error);
      return;
    }

    const cleanNew = validation.clean;

    if (cleanNew === currentUser.username) {
      setUsernameSaveSuccess(true);
      setTimeout(() => setUsernameSaveSuccess(false), 2500);
      return;
    }

    setIsSavingUsername(true);
    try {
      if (onUpdateUsername) {
        const res = await onUpdateUsername(cleanNew);
        if (res && res.error) {
          setUsernameSaveError(res.error);
          setIsSavingUsername(false);
          return;
        }
      } else {
        const res = await onUpdateProfile({
          displayName: displayName.trim(),
          bio: bio.trim(),
          avatar,
          username: cleanNew,
        });
        if (res && res.error) {
          setUsernameSaveError(res.error);
          setIsSavingUsername(false);
          return;
        }
      }

      setUsername(cleanNew);
      setUsernameSaveSuccess(true);
      setTimeout(() => setUsernameSaveSuccess(false), 3000);
    } catch (err: any) {
      setUsernameSaveError(err.message || 'Failed to update username. Please try again.');
    } finally {
      setIsSavingUsername(false);
    }
  };

  // Save full profile
  const handleSaveFullProfile = async () => {
    setProfileSaveError(null);
    setProfileSaveSuccess(false);

    const cleanDisplay = displayName.trim();

    let cleanUsername = currentUser.username;
    if (username.trim()) {
      const v = sanitizeUsername(username);
      if (v.error) {
        setProfileSaveError(v.error);
        return;
      }
      cleanUsername = v.clean;
    }

    setIsSavingProfile(true);
    try {
      const res = await onUpdateProfile({
        displayName: cleanDisplay,
        bio: bio.trim(),
        avatar,
        username: cleanUsername,
      });

      if (res && res.error) {
        setProfileSaveError(res.error);
        setIsSavingProfile(false);
        return;
      }

      setDisplayName(cleanDisplay);
      setUsername(cleanUsername);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } catch (err: any) {
      setProfileSaveError(err.message || 'Failed to save profile changes.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSelectAvatar = (selectedId: string) => {
    const nextAvatar = avatar === selectedId ? null : selectedId;
    setAvatar(nextAvatar);
    onUpdateProfile({
      displayName: displayName.trim(),
      bio: bio.trim(),
      avatar: nextAvatar,
      username: currentUser.username,
    });
  };

  const isAvatarSelected = (opt: UserAvatarOption) => {
    return Boolean(avatar) && (avatar === opt.id || avatar === opt.url);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Profile Header Banner Card */}
      <div className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-6 sm:p-8 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Active Selected Avatar with Camera Overlay (Circular empty placeholder if none) */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 p-[2px] shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                <div className="w-full h-full rounded-full bg-[#070b1a] overflow-hidden flex items-center justify-center">
                  {getUserAvatarUrl(avatar, uploadedAvatars) ? (
                    <img
                      src={getUserAvatarUrl(avatar, uploadedAvatars)}
                      alt={displayName || 'User Profile'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <User className="w-10 h-10 stroke-[1.5]" />
                      <span className="text-[9px] text-cyan-400 font-semibold mt-0.5">Choose Avatar</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload trigger button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-2 rounded-full bg-[#0e1633] text-cyan-400 hover:text-white border border-[#22305e] hover:border-cyan-400 shadow-md transition-all cursor-pointer"
                title="Upload image from your device"
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

            {/* Display Name and Username */}
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {displayName || <span className="text-slate-400 font-normal italic">No display name set</span>}
              </h2>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <span className="text-xs font-mono text-cyan-400 font-semibold px-2 py-0.5 rounded-lg bg-[#0e1633] border border-[#22305e]">
                  {currentUser.username ? `@${currentUser.username}` : <span className="text-slate-500 italic">No username set</span>}
                </span>
                <span className="text-[11px] text-slate-400">· Level {userStats.level}</span>
              </div>
              <p className="text-xs text-slate-300 max-w-md mt-1 leading-relaxed">
                {bio || <span className="text-slate-500 italic">No biography added yet. Enter one below.</span>}
              </p>
            </div>
          </div>

          {/* Switch Account / Login Button */}
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0e1633] hover:bg-[#152147] text-slate-300 hover:text-white border border-[#22305e] hover:border-cyan-400 text-xs font-semibold transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Switch / Login</span>
          </button>
        </div>
      </div>

      {/* Global Status Notifications */}
      {profileSaveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Profile changes saved and updated successfully across DebateX!</span>
        </div>
      )}

      {profileSaveError && (
        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{profileSaveError}</span>
        </div>
      )}

      {/* ================= SECTION 1: MY UPLOADED AVATARS ================= */}
      <section className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#17203d]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-purple-400" />
              <span>My Uploaded Avatars</span>
              {uploadedAvatars.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30">
                  {uploadedAvatars.length} Uploaded
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Personal images uploaded from your device. Only displays avatars you upload yourself.
            </p>
          </div>

          {uploadedAvatars.length > 0 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-full bg-[#121c38] hover:bg-[#1a2852] text-cyan-300 hover:text-white border border-[#233364] hover:border-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload More</span>
            </button>
          )}
        </div>

        {uploadedAvatars.length === 0 ? (
          /* Empty state when no avatars uploaded yet */
          <div className="rounded-2xl border border-dashed border-[#233364] bg-[#0c1228]/50 p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#121c38] border border-[#233364] text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950/40">
              <ImageIcon className="w-7 h-7 text-cyan-400/80" />
            </div>
            <div className="max-w-md space-y-1">
              <p className="text-sm font-bold text-slate-200">
                No uploaded avatars yet
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload a custom picture from your device to use it as your personal debate avatar.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-all cursor-pointer mt-1"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Image</span>
            </button>
          </div>
        ) : (
          /* Uploaded Avatars Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uploadedAvatars.map((opt) => {
              const isSelected = isAvatarSelected(opt);
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectAvatar(opt.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                      : 'border-[#1b254a] bg-[#0c1228] hover:border-[#2f3e75]'
                  }`}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 border border-slate-700/60 bg-slate-900">
                    <img
                      src={opt.url}
                      alt={opt.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected ? (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 flex items-center gap-1 shadow-md text-[10px] font-bold">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Active</span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {opt.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">
                      {opt.tagline}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Upload More Card Tile */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl border border-dashed border-[#233364] hover:border-cyan-400 bg-[#090f24]/50 hover:bg-[#0c1430] transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 aspect-square group"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#121c38] group-hover:bg-[#1a2958] border border-[#233364] group-hover:border-cyan-400 text-cyan-400 flex items-center justify-center transition-all shadow-sm">
                <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  Upload More
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  PNG, JPG or WebP
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ================= SECTION 2: BUILT-IN AVATARS ================= */}
      <section className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#17203d]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Built-in Avatars (12 Unique Illustrated Styles)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              12 original illustrated characters with distinctive hairstyles, expressions, outfits, color palettes, and aesthetics.
            </p>
          </div>
        </div>

        {/* 12 Built-in Avatars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {USER_AVATARS.map((av) => {
            const isSelected = isAvatarSelected(av);
            return (
              <div
                key={av.id}
                onClick={() => handleSelectAvatar(av.id)}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                    : 'border-[#1b254a] bg-[#0c1228] hover:border-[#2f3e75] hover:bg-[#0e1633]'
                }`}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2 border border-slate-700/60 bg-slate-900">
                  <img
                    src={av.url}
                    alt={av.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected ? (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 flex items-center gap-0.5 shadow-md text-[9px] font-extrabold tracking-wide">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>ACTIVE</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                    {av.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate leading-tight">
                    {av.tagline}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Edit Profile & Independent Username Section */}
      <section className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-6 space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#17203d]">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-purple-400" />
            <span>Profile Details & Username</span>
          </h3>
          <span className="text-xs text-slate-400">Works independently</span>
        </div>

        {/* 1. Independent Username Editing Field */}
        <div className="p-4 rounded-2xl bg-[#0e1633] border border-[#22305e] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Unique Username</span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {currentUser.username ? `(@${currentUser.username})` : '(Not set)'}
                </span>
              </label>
              <p className="text-[11px] text-slate-400">
                Your unique account identifier. Updates everywhere in the app upon saving.
              </p>
            </div>

            {/* Dedicated Save Username Button */}
            <button
              type="button"
              disabled={isSavingUsername || !username.trim()}
              onClick={handleSaveUsernameOnly}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
            >
              {isSavingUsername ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  <span>Save Username</span>
                </>
              )}
            </button>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 font-mono text-xs font-bold select-none">
              @
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (usernameSaveError) setUsernameSaveError(null);
              }}
              placeholder="choose_username (e.g. debater_one)"
              className="w-full pl-8 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-[#060913] border border-[#1b254a] text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          {/* Username Status Notifications */}
          {usernameSaveSuccess && (
            <p className="text-xs text-emerald-300 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Username successfully saved and updated across DebateX!</span>
            </p>
          )}

          {usernameSaveError && (
            <p className="text-xs text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{usernameSaveError}</span>
            </p>
          )}
        </div>

        {/* 2. Display Name and Bio Fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Display Name</span>
              <span className="text-[11px] text-slate-500">How your name appears in debates</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your preferred display name (e.g. Alex Vance)"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-[#060913] border border-[#1b254a] text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Short Biography</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other debaters what topics and ideas you enjoy discussing..."
              className="w-full p-3 text-xs sm:text-sm rounded-xl bg-[#060913] border border-[#1b254a] text-white focus:outline-none focus:border-cyan-400 placeholder-slate-500 resize-none"
            />
          </div>
        </div>

        {/* Unified Save All Changes CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#17203d]">
          <p className="text-[11px] text-slate-400 text-center sm:text-left">
            Changes persist permanently and remain saved upon page refresh.
          </p>

          <button
            type="button"
            disabled={isSavingProfile}
            onClick={handleSaveFullProfile}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-[#d946ef] to-[#06b6d4] hover:from-[#c026d3] hover:to-[#0891b2] text-white font-bold text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSavingProfile ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Stats & Achievements Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Total Completed Debates */}
        <div className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-5 space-y-2">
          <div className="flex items-center gap-2 text-purple-400">
            <Trophy className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Completed Debates
            </h4>
          </div>
          <p className="text-3xl font-extrabold font-mono text-white">
            {userStats.totalDebates}
          </p>
          <p className="text-xs text-slate-400">
            {userStats.totalDebates === 0
              ? 'Complete your first debate to see it counted here!'
              : `${userStats.wins} won out of ${userStats.totalDebates} total debates.`}
          </p>
        </div>

        {/* Achievements */}
        <div className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <Award className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Earned Achievements
            </h4>
          </div>
          <p className="text-3xl font-extrabold font-mono text-amber-400">
            {userStats.achievements.length}
          </p>
          <p className="text-xs text-slate-400">
            {userStats.achievements.length === 0
              ? 'Unlock badges by completing debates and trying different topics!'
              : `${userStats.achievements.length} badges unlocked.`}
          </p>
        </div>
      </div>

      {/* User's Debate History Snapshot */}
      <section className="rounded-3xl bg-[#090e21] border border-[#1b254a] p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#17203d]">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <span>Your Completed Debates</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {debates.length} logged
          </span>
        </div>

        {debates.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            You haven't completed any debates yet. Your debate history will appear right here once you finish your first debate!
          </div>
        ) : (
          <div className="space-y-3">
            {debates.map((debate) => (
              <div
                key={debate.id}
                className="p-4 rounded-2xl bg-[#0e1633] border border-[#22305e] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {debate.topicTitle}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>vs {debate.characterName}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {debate.date}
                    </span>
                    <span>·</span>
                    <span className="text-emerald-400 font-semibold">{debate.outcome}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenTranscript(debate)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#141d3d] hover:bg-[#1e2c5e] text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-[#2b3c75] cursor-pointer self-start sm:self-auto"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
