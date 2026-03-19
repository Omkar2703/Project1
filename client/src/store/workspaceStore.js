import { create } from 'zustand'

export const useWorkspaceStore = create((set) => ({
  workspaces: [],
  activeWorkspace: null,

  setWorkspaces: (workspaces) => set({ workspaces }),

  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  addWorkspace: (workspace) =>
    set((state) => ({ workspaces: [...state.workspaces, workspace] })),

  removeWorkspace: (id) =>
    set((state) => ({
      workspaces: state.workspaces.filter(w => w._id !== id)
    }))
}))