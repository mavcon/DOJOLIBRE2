import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { useMessageStore } from '../store/messageStore';
import { MessageDialog } from '../components/messages/MessageDialog';
import { Search, MessageCircle } from 'lucide-react';
import { MemberInteractions } from '../components/shared/MemberInteractions';

export function MessagesPage() {
  const currentUser = useAuthStore(state => state.user);
  const { getMemberUsers } = useUserStore();
  const { getConversation } = useMessageStore();
  const [selectedUser, setSelectedUser] = useState<ReturnType<typeof getMemberUsers>[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Only allow members to access messages
  if (!currentUser || currentUser.role !== 'MEMBER') {
    return null;
  }

  // Get only member users
  const memberUsers = getMemberUsers();

  const conversations = memberUsers
    .filter(user => user.id !== currentUser.id)
    .map(user => ({
      user,
      messages: getConversation(currentUser.id, user.id),
    }))
    .filter(conv => 
      conv.messages.length > 0 || 
      conv.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const sortedConversations = conversations.sort((a, b) => {
    const aLastMessage = a.messages[a.messages.length - 1];
    const bLastMessage = b.messages[b.messages.length - 1];
    if (!aLastMessage) return 1;
    if (!bLastMessage) return -1;
    return new Date(bLastMessage.timestamp).getTime() - new Date(aLastMessage.timestamp).getTime();
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-black rounded-lg shadow-md border dark:border-gray-800">
        {sortedConversations.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <p>No conversations yet</p>
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-800">
            {sortedConversations.map(({ user, messages }) => {
              const lastMessage = messages[messages.length - 1];
              const unreadCount = messages.filter(
                msg => msg.receiverId === currentUser.id && !msg.read
              ).length;

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xl font-medium text-indigo-600 dark:text-indigo-400">
                            {user.name[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{user.name}</h3>
                          {lastMessage && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(lastMessage.timestamp).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {lastMessage && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {unreadCount > 0 && (
                        <div className="bg-indigo-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                          {unreadCount}
                        </div>
                      )}
                      <MemberInteractions 
                        member={user}
                        size="sm"
                        showMessage={false}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedUser && (
          <MessageDialog
            recipient={selectedUser}
            isOpen={!!selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}