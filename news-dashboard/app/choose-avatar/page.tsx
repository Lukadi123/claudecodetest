'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AvatarPicker, type AvatarSelection } from '@/components/ui/avatar-picker';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';

export default function ChooseAvatarPage() {
  const { user, profile, loading: authLoading, updateAvatar } = useAuth();
  const router = useRouter();
  const [selection, setSelection] = useState<AvatarSelection | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-[#BFF549] animate-spin" />
      </div>
    );
  }

  async function handleContinue() {
    if (!selection || !user) return;
    setError('');
    setSubmitting(true);

    try {
      if (selection.type === 'preset') {
        const result = await updateAvatar(selection.avatarId, null);
        if (result.error) {
          setError(result.error);
        } else {
          router.push('/');
          return; // Keep submitting true during navigation
        }
      } else {
        // Upload custom image to Supabase Storage
        const fileExt = selection.file.name.split('.').pop();
        const filePath = `${user.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, selection.file, { upsert: true });

        if (uploadError) {
          setError(uploadError.message);
          setSubmitting(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const result = await updateAvatar(null, urlData.publicUrl);
        if (result.error) {
          setError(result.error);
        } else {
          router.push('/');
          return; // Keep submitting true during navigation
        }
      }
    } finally {
      // Reset submitting on error paths (success paths exit early with return)
      setSubmitting(false);
    }
  }

  const hasSelection = selection !== null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black tracking-tight">
            News<span className="text-[#BFF549]">Pulse</span>
          </h1>
          <p className="text-sm text-[#99A1AF] mt-2">Almost there! Choose your avatar</p>
        </div>

        <AvatarPicker
          userName={profile?.name || 'Me'}
          onSelect={(sel) => setSelection(sel)}
        />

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm bg-red-400/10 px-3 py-2 border border-red-400/20 mt-4 text-center"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          onClick={handleContinue}
          disabled={!hasSelection || submitting}
          className="w-full mt-6 py-3 bg-[#93b44a] text-black font-semibold text-sm uppercase tracking-wider hover:bg-[#BFF549] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Saving...' : 'Continue'}
        </motion.button>

        {!hasSelection && (
          <motion.p
            className="text-center text-xs text-[#99A1AF]/60 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Select an avatar or upload your own to continue
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
