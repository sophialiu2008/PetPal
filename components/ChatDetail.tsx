
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface Props {
  chat: {
    id: string;
    name: string;
    avatar: string;
    isOnline?: boolean;
  };
  onBack: () => void;
}

const ChatDetail: React.FC<Props> = ({ chat, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', senderId: chat.id, text: '嗨！我是 ' + chat.name + '。', time: '10:00 AM', isMe: false },
    { id: '2', senderId: 'me', text: '你好！我想咨询一下关于领养的事情。', time: '10:01 AM', isMe: true },
    { id: '3', senderId: chat.id, text: '没问题，你对哪只毛孩子感兴趣？', time: '10:02 AM', isMe: false },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setMessages([...messages, newMessage]);
    setInput('');
    
    // Simulate haptic
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  return (
    <div className="absolute inset-0 z-[60] bg-white dark:bg-dark-bg flex flex-col animate-fade-in">
      {/* iOS Style Header */}
      <header className="pt-12 pb-3 px-4 apple-blur bg-ios-blur dark:bg-dark-blur/80 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-2 text-ios-accent active:opacity-50 transition-opacity">
            <span className="material-symbols-outlined text-3xl">chevron_left</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-dark-bg rounded-full" />
            </div>
            <div>
              <h3 className="font-bold dark:text-white text-sm">{chat.name}</h3>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Online</p>
            </div>
          </div>
        </div>
        <button className="p-2 text-ios-accent">
          <span className="material-symbols-outlined">videocam</span>
        </button>
      </header>

      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar pb-32"
      >
        <div className="text-center py-4">
          <span className="text-[10px] font-bold text-ios-secondary uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">Today 10:00 AM</span>
        </div>
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            <div className={`
              max-w-[75%] px-4 py-2.5 rounded-2xl text-[15px] font-medium leading-relaxed
              ${m.isMe 
                ? 'bg-ios-accent text-white rounded-tr-none shadow-sm' 
                : 'bg-ios-bg dark:bg-white/10 dark:text-white rounded-tl-none'}
            `}>
              {m.text}
              <p className={`text-[9px] mt-1 font-bold ${m.isMe ? 'text-white/60 text-right' : 'text-ios-secondary'}`}>
                {m.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* iOS Messages Input Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-10 apple-blur bg-ios-blur dark:bg-dark-blur/80 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <button className="mb-2 text-ios-secondary hover:text-ios-accent transition-colors">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="iMessage"
              rows={1}
              className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-700 rounded-[22px] px-5 py-2.5 text-sm dark:text-white outline-none focus:ring-1 focus:ring-ios-accent/30 transition-all resize-none max-h-32"
              style={{ height: 'auto' }}
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className={`
              mb-1 w-8 h-8 rounded-full flex items-center justify-center transition-all
              ${input.trim() ? 'bg-ios-accent text-white scale-110 shadow-lg' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}
            `}
          >
            <span className="material-symbols-outlined text-[20px] font-bold">arrow_upward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;
