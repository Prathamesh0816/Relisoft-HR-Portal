import { create } from 'zustand';

const useAIStore = create((set) => ({
  aiEnabled: false,
  aiProvider: 'openai',
  humanReviewRequired: true,
  pendingReviews: [],
  aiConfig: null,

  setAIConfig: (config) => set({ ...config }),
  setPendingReviews: (reviews) => set({ pendingReviews: reviews }),
  addReview: (review) => set((state) => ({ pendingReviews: [...state.pendingReviews, review] })),
  removeReview: (id) => set((state) => ({
    pendingReviews: state.pendingReviews.filter(r => r._id !== id)
  })),
  setAIEnabled: (enabled) => set({ aiEnabled: enabled }),
}));

export default useAIStore;
