'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';
import { avatars } from '@/components/ui/avatar-picker';

function getAvatarById(id: number | null | undefined) {
  if (id === null || id === undefined) return null;
  return avatars.find((a) => a.id === id) ?? null;
}

export function ProfileAvatar() {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await signOut();
    router.push('/login');
  }

  const selectedAvatar = getAvatarById(profile?.avatar_id);
  const hasCustomImage = profile?.avatar_url && !profile?.avatar_id;

  function renderAvatar(size: number) {
    if (hasCustomImage) {
      return (
        <img
          src={profile!.avatar_url!}
          alt="Avatar"
          style={{ width: size, height: size }}
          className="object-cover"
        />
      );
    }
    if (selectedAvatar) {
      return (
        <div style={{ width: size, height: size }} className="flex items-center justify-center [&_svg]:w-full [&_svg]:h-full">
          {selectedAvatar.svg}
        </div>
      );
    }
    return <User className="w-5 h-5 text-black" />;
  }

  return (
    <div ref={ref} className="fixed top-4 left-8 z-50 flex items-center gap-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#BFF549] transition-all duration-300 bg-[#93b44a]"
      >
        {renderAvatar(48)}
      </button>
      {profile?.name && (
        <div className="flex flex-col">
          <span className="text-xs text-[#99A1AF]">Welcome!</span>
          <span className="text-sm text-white font-semibold">{profile.name}</span>
        </div>
      )}

      {open && (
        <div className="absolute top-14 left-0 glass-card p-6 min-w-[300px]">
          {profile ? (
            <div className="space-y-4">
              <div className="flex justify-center mb-3">
                <div className="w-20 h-20 rounded-full overflow-hidden">
                  {renderAvatar(80)}
                </div>
              </div>
              <div>
                <p className="text-xs text-[#99A1AF] uppercase tracking-wider">Name</p>
                <p className="text-base text-white font-medium">{profile.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-[#99A1AF] uppercase tracking-wider">Email</p>
                <p className="text-base text-white font-medium">{profile.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-[#99A1AF] uppercase tracking-wider">Age</p>
                <p className="text-base text-white font-medium">{profile.age ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-[#99A1AF] uppercase tracking-wider">Gender</p>
                <p className="text-base text-white font-medium">{profile.gender || '—'}</p>
              </div>

              <div className="border-t border-[#93b44a]/20 pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#99A1AF] hover:text-[#BFF549] hover:bg-white/5 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#99A1AF]">Loading profile...</p>
          )}
        </div>
      )}
    </div>
  );
}
