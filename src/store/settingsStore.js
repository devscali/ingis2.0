import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark', // 'dark' | 'light'

      // API Keys
      openaiApiKey: '',

      // Team members (editable)
      teamMembers: [
        { id: 'carlos', name: 'Carlos Armando', color: 'bg-blue-500' },
        { id: 'leslie', name: 'Leslie Marlene', color: 'bg-pink-500' },
        { id: 'sara', name: 'Sara Esther', color: 'bg-purple-500' },
        { id: 'vladimir', name: 'Vladimir', color: 'bg-indigo-500' },
        { id: 'ian', name: 'Ian Andrade', color: 'bg-green-500' },
        { id: 'jesus', name: 'Jesus Lerma', color: 'bg-orange-500' },
      ],

      // Actions
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      setOpenaiApiKey: (key) => set({ openaiApiKey: key }),

      addTeamMember: (member) => set((state) => ({
        teamMembers: [...state.teamMembers, { ...member, id: Date.now().toString() }]
      })),

      updateTeamMember: (id, updates) => set((state) => ({
        teamMembers: state.teamMembers.map(m => m.id === id ? { ...m, ...updates } : m)
      })),

      removeTeamMember: (id) => set((state) => ({
        teamMembers: state.teamMembers.filter(m => m.id !== id)
      })),
    }),
    {
      name: 'ignis-settings',
    }
  )
)
