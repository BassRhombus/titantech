'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export type GeneratorType = 'commands-ini' | 'game-ini' | 'rules-motd' | 'mod-manager' | 'curve-overrides';

interface ProfileData {
  id: string;
  name: string;
  generatorType: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface ProfilesResponse {
  success: boolean;
  profiles: ProfileData[];
  count: number;
  maxProfiles: number;
}

export function useProfiles(generatorType: GeneratorType) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const queryKey = ['profiles', generatorType];

  const isAuthenticated = !!session?.user;

  const { data, isLoading } = useQuery<ProfilesResponse>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/profiles/${generatorType}`);
      if (!res.ok) throw new Error('Failed to fetch profiles');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const saveProfile = useMutation({
    mutationFn: async ({ name, data: profileData }: { name: string; data: Record<string, unknown> }) => {
      const res = await fetch(`/api/profiles/${generatorType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, data: profileData }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save profile');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateProfile = useMutation({
    mutationFn: async ({ id, name, data: profileData }: { id: string; name?: string; data?: Record<string, unknown> }) => {
      const res = await fetch(`/api/profiles/${generatorType}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, data: profileData }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update profile');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteProfile = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/profiles/${generatorType}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete profile');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    profiles: data?.profiles || [],
    maxProfiles: data?.maxProfiles || 10,
    isLoading,
    isAuthenticated,
    saveProfile,
    updateProfile,
    deleteProfile,
  };
}
