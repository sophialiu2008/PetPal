
import React, { useState } from 'react';
import ChatDetail from '../components/ChatDetail';

const MessagesPage: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const chats = [
    { id: '1', name: 'Sarah J.', avatar: 'https://i.pravatar.cc/150?u=sarah', lastMsg: 'Bella 的疫苗接种证明我已经准备好了。', time: '10:30 AM', unread: 2, isOnline: true },
    { id: '2', name: 'David W.', avatar: 'https://i.pravatar.cc/150?u=david', lastMsg: '你可以周六下午来看看 Mochi 吗？', time: 'Yesterday', unread: 0, isOnline: true },
    { id: '3', name: 'Michael R.', avatar: 'https://i.pravatar.cc/150?u=mike', lastMsg: 'Luna 真的很喜欢这种猫粮。', time: 'Tue', unread: 0, isOnline: false },
    { id: '4', name: 'Emma L.', avatar: 'https://i.pravatar.cc/150?u=emma', lastMsg: '感谢你对 Charlie 的照顾！', time: 'Monday', unread: 0, isOnline: true },
  ];

  const activeChat = chats.find(c => c.id === selectedChatId);

  return (
    <div className="h-full bg-white dark:bg-dark-bg transition-colors relative flex flex-col">
      {/* Chat List View */}
      <div className={`flex-1 flex flex-col ${selectedChatId ? 'hidden' : ''}`}>
        <header className="pt-16 pb-4 px-6 border-b border-gray-50 dark:border-gray-900">
          <h1 className="text-3xl font-extrabold dark:text-white tracking-tight">Messages</h1>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="divide-y divide-gray-50 dark:divide-gray-900">
            {chats.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => setSelectedChatId(chat.id)}
                className="bg-white dark:bg-dark-bg px-6 py-4 flex items-center gap-4 active:bg-gray-50 dark:active:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm group-active:scale-95 transition-transform">
                    <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                  </div>
                  {chat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-dark-bg rounded-full shadow-sm" />
                  )}
                  {chat.unread > 0 && (
                    <div className="absolute -top-1 -right-1 bg-ios-accent text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-dark-bg shadow-sm">
                      {chat.unread}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold dark:text-white text-[16px] tracking-tight">{chat.name}</h3>
                    <span className="text-[11px] text-ios-secondary font-bold uppercase">{chat.time}</span>
                  </div>
                  <p className={`text-[13px] truncate font-medium ${chat.unread > 0 ? 'text-ios-text dark:text-white font-bold' : 'text-ios-secondary opacity-80'}`}>
                    {chat.lastMsg}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-gray-200 dark:text-gray-800 group-hover:text-ios-accent transition-colors">chevron_right</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Detail View */}
      {activeChat && (
        <ChatDetail 
          chat={activeChat} 
          onBack={() => setSelectedChatId(null)} 
        />
      )}
    </div>
  );
};

export default MessagesPage;
