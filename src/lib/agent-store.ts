/**
 * Agent State Management with Zustand
 * Global state for the OG Lab Agent
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile } from './supabase-client';
import type { ConversationMessage } from './conversations-db';

interface AgentState {
  // User profile
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  
  // Current conversation
  conversationId: string | null;
  messages: ConversationMessage[];
  setConversationId: (id: string) => void;
  addMessage: (message: ConversationMessage) => void;
  clearMessages: () => void;
  
  // UI state
  isOpen: boolean;
  isMinimized: boolean;
  isLoading: boolean;
  isRecording: boolean;
  error: string | null;
  
  setIsOpen: (isOpen: boolean) => void;
  setIsMinimized: (isMinimized: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsRecording: (isRecording: boolean) => void;
  setError: (error: string | null) => void;
  
  // Product cart
  cart: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  addToCart: (product: { productName: string; quantity: number; price: number }) => void;
  removeFromCart: (productName: string) => void;
  clearCart: () => void;
  
  // Session
  sessionStartTime: number | null;
  startSession: () => void;
  endSession: () => void;
  
  // Reset all state
  reset: () => void;
}

const initialState = {
  userProfile: null,
  conversationId: null,
  messages: [],
  isOpen: false,
  isMinimized: false,
  isLoading: false,
  isRecording: false,
  error: null,
  cart: [],
  sessionStartTime: null,
};

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      setConversationId: (id) => set({ conversationId: id }),
      
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message],
      })),
      
      clearMessages: () => set({ messages: [] }),
      
      setIsOpen: (isOpen) => set({ isOpen }),
      
      setIsMinimized: (isMinimized) => set({ isMinimized }),
      
      setIsLoading: (isLoading) => set({ isLoading }),
      
      setIsRecording: (isRecording) => set({ isRecording }),
      
      setError: (error) => set({ error }),
      
      addToCart: (product) => set((state) => {
        const existingProduct = state.cart.find(
          item => item.productName === product.productName
        );
        
        if (existingProduct) {
          return {
            cart: state.cart.map(item =>
              item.productName === product.productName
                ? { ...item, quantity: item.quantity + product.quantity }
                : item
            ),
          };
        }
        
        return {
          cart: [...state.cart, product],
        };
      }),
      
      removeFromCart: (productName) => set((state) => ({
        cart: state.cart.filter(item => item.productName !== productName),
      })),
      
      clearCart: () => set({ cart: [] }),
      
      startSession: () => set({ sessionStartTime: Date.now() }),
      
      endSession: () => set({ sessionStartTime: null }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'oglab-agent-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist user profile and cart
      partialize: (state) => ({
        userProfile: state.userProfile,
        cart: state.cart,
      }),
    }
  )
);

