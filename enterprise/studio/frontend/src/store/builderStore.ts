import { create } from 'zustand'

interface BuilderState {
  draftNodes: string
  draftEdges: string
  draftMetadata: string
  setDraftNodes: (value: string) => void
  setDraftEdges: (value: string) => void
  setDraftMetadata: (value: string) => void
  resetDrafts: (nodes: string, edges: string, metadata: string) => void
}

export const useBuilderStore = create<BuilderState>((set) => ({
  draftNodes: '',
  draftEdges: '',
  draftMetadata: '',
  setDraftNodes: (draftNodes) => set({ draftNodes }),
  setDraftEdges: (draftEdges) => set({ draftEdges }),
  setDraftMetadata: (draftMetadata) => set({ draftMetadata }),
  resetDrafts: (draftNodes, draftEdges, draftMetadata) =>
    set({ draftNodes, draftEdges, draftMetadata }),
}))