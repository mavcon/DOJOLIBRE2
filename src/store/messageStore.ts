import { create } from 'zustand';
import { Message } from '../types/user';

interface MessageState {
  messages: Record<string, Message[]>;
  addMessage: (message: Message) => void;
  markAsRead: (messageId: string) => void;
  getConversation: (userId1: string, userId2: string) => Message[];
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: {},
  
  addMessage: (message) => set((state) => {
    const conversationKey = [message.senderId, message.receiverId].sort().join('-');
    const conversation = state.messages[conversationKey] || [];
    return {
      messages: {
        ...state.messages,
        [conversationKey]: [...conversation, message],
      },
    };
  }),

  markAsRead: (messageId) => set((state) => {
    const newMessages = { ...state.messages };
    Object.keys(newMessages).forEach((key) => {
      newMessages[key] = newMessages[key].map((msg) =>
        msg.id === messageId ? { ...msg, read: true } : msg
      );
    });
    return { messages: newMessages };
  }),

  getConversation: (userId1, userId2) => {
    const conversationKey = [userId1, userId2].sort().join('-');
    return get().messages[conversationKey] || [];
  },
}));