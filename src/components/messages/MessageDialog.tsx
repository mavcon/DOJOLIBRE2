import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { Message, UserProfile } from '../../types/user';
import { useMessageStore } from '../../store/messageStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

interface MessageDialogProps {
  recipient: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function MessageDialog({ recipient, isOpen, onClose }: MessageDialogProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useAuthStore((state) => state.user);
  const { getConversation, addMessage } = useMessageStore();
  
  const conversation = currentUser 
    ? getConversation(currentUser.id, recipient.id)
    : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, conversation.length]);

  const handleSend = () => {
    if (!message.trim() || !currentUser) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: recipient.id,
      content: message,
      timestamp: new Date(),
      read: false,
    };

    addMessage(newMessage);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-lg border dark:border-gray-800"
          >
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-800">
              <h2 className="text-lg font-semibold">@{recipient.username}</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {conversation.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.senderId === currentUser?.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t dark:border-gray-800">
              <div className="form-group relative flex items-end gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="peer w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[5px] transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-transparent resize-none"
                  rows={2}
                />
                <label className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white dark:peer-focus:bg-black peer-focus:px-1 peer-focus:text-indigo-600 dark:peer-focus:text-indigo-400 peer-valid:-top-2 peer-valid:left-2 peer-valid:text-xs peer-valid:bg-white dark:peer-valid:bg-black peer-valid:px-1">
                  Type a message...
                </label>
                <Button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}