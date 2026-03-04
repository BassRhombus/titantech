'use client';

import { useState } from 'react';
import { Save, FolderOpen, Trash2, LogIn, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useProfiles, type GeneratorType } from '@/hooks/useProfiles';
import { Modal } from '@/components/ui/Modal';

interface ProfileManagerProps {
  generatorType: GeneratorType;
  /** Return current state as a JSON-serializable object */
  getCurrentData: () => Record<string, unknown>;
  /** Load saved data into the tool */
  onLoadData: (data: Record<string, unknown>) => void;
}

export function ProfileManager({ generatorType, getCurrentData, onLoadData }: ProfileManagerProps) {
  const {
    profiles,
    maxProfiles,
    isLoading,
    isAuthenticated,
    saveProfile,
    updateProfile,
    deleteProfile,
  } = useProfiles(generatorType);

  const [expanded, setExpanded] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveMode, setSaveMode] = useState<'new' | 'overwrite'>('new');
  const [overwriteId, setOverwriteId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [loadedProfileId, setLoadedProfileId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="card p-4">
        <h3 className="font-heading font-semibold text-sm mb-2 flex items-center gap-2">
          <Save size={16} className="text-primary-light" />
          Saved Profiles
        </h3>
        <p className="text-xs text-text-secondary mb-3">
          Sign in with Discord to save and load your configurations.
        </p>
        <button
          onClick={() => signIn('discord')}
          className="btn-outline w-full flex items-center justify-center gap-2 text-sm"
        >
          <LogIn size={16} />
          Sign In to Save
        </button>
      </div>
    );
  }

  function handleSave() {
    setSaveError('');
    setSaveSuccess('');
    setSaveMode('new');
    setOverwriteId(null);
    setProfileName('');
    setShowSaveModal(true);
  }

  async function confirmSave() {
    if (!profileName.trim()) {
      setSaveError('Please enter a profile name');
      return;
    }

    setSaveError('');
    const data = getCurrentData();

    try {
      if (saveMode === 'overwrite' && overwriteId) {
        await updateProfile.mutateAsync({ id: overwriteId, name: profileName.trim(), data });
        setSaveSuccess('Profile updated!');
        setLoadedProfileId(overwriteId);
      } else {
        const result = await saveProfile.mutateAsync({ name: profileName.trim(), data });
        setSaveSuccess('Profile saved!');
        if (result.profile?.id) setLoadedProfileId(result.profile.id);
      }
      setTimeout(() => {
        setShowSaveModal(false);
        setSaveSuccess('');
      }, 1000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    }
  }

  function handleLoad(profile: { id: string; name: string; data: Record<string, unknown> }) {
    onLoadData(profile.data);
    setLoadedProfileId(profile.id);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete profile "${name}"?`)) return;
    try {
      await deleteProfile.mutateAsync(id);
      if (loadedProfileId === id) setLoadedProfileId(null);
    } catch {}
  }

  function handleOverwrite(profile: { id: string; name: string }) {
    setSaveError('');
    setSaveSuccess('');
    setSaveMode('overwrite');
    setOverwriteId(profile.id);
    setProfileName(profile.name);
    setShowSaveModal(true);
  }

  return (
    <>
      <div className="card overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
            <Save size={16} className="text-primary-light" />
            Profiles ({profiles.length}/{maxProfiles})
          </h3>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-3">
            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saveProfile.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Save size={16} />
              {saveProfile.isPending ? 'Saving...' : 'Save Current Config'}
            </button>

            {/* Profile list */}
            {isLoading ? (
              <p className="text-xs text-text-secondary text-center py-3">Loading profiles...</p>
            ) : profiles.length > 0 ? (
              <div className="space-y-2">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`flex items-center gap-2 p-2.5 rounded-lg transition-colors ${
                      loadedProfileId === profile.id
                        ? 'bg-primary/10 border border-primary/30'
                        : 'bg-surface/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{profile.name}</p>
                      <p className="text-[10px] text-text-secondary">
                        {new Date(profile.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLoad(profile)}
                      title="Load"
                      className="p-1.5 text-text-secondary hover:text-primary-light transition-colors"
                    >
                      <FolderOpen size={14} />
                    </button>
                    <button
                      onClick={() => handleOverwrite(profile)}
                      title="Overwrite"
                      className="p-1.5 text-text-secondary hover:text-accent-light transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(profile.id, profile.name)}
                      title="Delete"
                      className="p-1.5 text-text-secondary hover:text-error transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-secondary text-center py-3">
                No saved profiles yet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Save Modal */}
      <Modal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title={saveMode === 'overwrite' ? 'Update Profile' : 'Save Profile'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Profile Name</label>
            <input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="My Server Config"
              className="input-field w-full"
              maxLength={50}
              autoFocus
            />
          </div>

          {saveError && (
            <p className="text-sm text-red-400">{saveError}</p>
          )}
          {saveSuccess && (
            <p className="text-sm text-green-400">{saveSuccess}</p>
          )}

          <div className="flex justify-end gap-3">
            <button onClick={() => setShowSaveModal(false)} className="btn-outline">Cancel</button>
            <button
              onClick={confirmSave}
              disabled={saveProfile.isPending || updateProfile.isPending}
              className="btn-primary disabled:opacity-50"
            >
              {saveMode === 'overwrite' ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
