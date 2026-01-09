
import React, { useState, useRef } from 'react';

interface Post {
  id: number;
  user: string;
  avatar: string;
  content: string;
  image: string;
  likes: number;
  comments: number;
  tags: string[];
  isLiked: boolean;
  time: string;
}

const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'For You' | 'Following'>('For You');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      user: 'Max P.',
      avatar: 'https://i.pravatar.cc/150?u=max',
      content: 'Buster 今天在金门公园玩疯了！他最喜欢耳边吹过的风。🐕💨 #金门公园 #萨摩耶',
      image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=600',
      likes: 1240,
      comments: 45,
      tags: ['日常', '户外'],
      isLiked: false,
      time: '2h ago'
    },
    {
      id: 2,
      user: 'Chloe S.',
      avatar: 'https://i.pravatar.cc/150?u=chloe',
      content: '懒洋洋的周日。Mittens 总是能霸占整张床，我只能睡床角。😴🐱 #猫奴日常',
      image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&q=80&w=600',
      likes: 850,
      comments: 22,
      tags: ['猫咪', '午睡'],
      isLiked: true,
      time: '5h ago'
    }
  ]);

  const stories = [
    { name: 'Your Story', avatar: 'https://i.pravatar.cc/150?u=user123', isNew: false, isUser: true },
    { name: 'Oliver', avatar: 'https://i.pravatar.cc/150?u=oliver', isNew: true },
    { name: 'Luna', avatar: 'https://i.pravatar.cc/150?u=luna', isNew: true },
    { name: 'Cooper', avatar: 'https://i.pravatar.cc/150?u=cooper', isNew: true },
    { name: 'Milo', avatar: 'https://i.pravatar.cc/150?u=milo', isNew: false },
    { name: 'Bella', avatar: 'https://i.pravatar.cc/150?u=bella', isNew: false },
  ];

  const handleLike = (id: number) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post
    ));
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim() && !selectedImage) return;

    const newPost: Post = {
      id: Date.now(),
      user: 'Alex Johnson',
      avatar: 'https://i.pravatar.cc/150?u=user123',
      content: newPostContent,
      image: selectedImage || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600',
      likes: 0,
      comments: 0,
      tags: [],
      isLiked: false,
      time: 'Just now'
    };

    setPosts([newPost, ...posts]);
    setShowCreatePost(false);
    setNewPostContent('');
    setSelectedImage(null);
    
    if ('vibrate' in navigator) navigator.vibrate(20);
  };

  return (
    <div className="h-full bg-ios-bg dark:bg-dark-bg transition-colors flex flex-col relative">
      {/* Premium Header with Tabs */}
      <header className="pt-16 pb-2 px-6 apple-blur bg-ios-blur dark:bg-dark-blur/80 sticky top-0 z-40">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold dark:text-white tracking-tight">Community</h1>
          <div className="flex gap-3">
            <button className="w-10 h-10 rounded-full bg-white dark:bg-dark-card shadow-sm flex items-center justify-center active:scale-90 transition-all">
              <span className="material-symbols-outlined text-ios-text dark:text-white text-xl">search</span>
            </button>
            <button 
              onClick={() => setShowCreatePost(true)}
              className="w-10 h-10 rounded-full bg-ios-accent text-white shadow-lg shadow-ios-accent/30 flex items-center justify-center active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-xl">add</span>
            </button>
          </div>
        </div>

        {/* Apple Style Segmented Control */}
        <div className="flex p-1 bg-gray-200/50 dark:bg-white/10 rounded-xl mb-4">
          {(['For You', 'Following'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all duration-300 ${
                activeTab === tab 
                ? 'bg-white dark:bg-dark-card shadow-sm text-ios-text dark:text-white' 
                : 'text-ios-secondary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Stories Bar */}
        <div className="py-6 flex gap-4 overflow-x-auto px-6 no-scrollbar">
          {stories.map((story, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className={`
                p-1 rounded-full 
                ${story.isNew ? 'bg-gradient-to-tr from-ios-accent to-orange-400' : 'bg-gray-200 dark:bg-gray-800'}
                transition-transform active:scale-90 cursor-pointer
              `}>
                <div className="p-0.5 bg-ios-bg dark:bg-dark-bg rounded-full">
                  <div className="relative">
                    <img src={story.avatar} alt={story.name} className="w-16 h-16 rounded-full object-cover" />
                    {story.isUser && (
                      <div className="absolute bottom-0 right-0 bg-ios-accent text-white rounded-full p-0.5 border-2 border-ios-bg dark:border-dark-bg">
                        <span className="material-symbols-outlined text-[12px] font-bold">add</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-bold ${story.isNew ? 'text-ios-text dark:text-white' : 'text-ios-secondary'}`}>
                {story.isUser ? 'My Story' : story.name}
              </span>
            </div>
          ))}
        </div>

        {/* Feed Posts */}
        <div className="px-6 space-y-8 pb-32">
          {posts.map((post, i) => (
            <div 
              key={post.id} 
              className="bg-white dark:bg-dark-card rounded-ios-lg overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-none animate-slide-up"
              style={{ animationDelay: `${(i + 3) * 100}ms` }}
            >
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-ios-accent/10">
                    <img src={post.avatar} alt={post.user} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm dark:text-white">{post.user}</h3>
                    <p className="text-[10px] text-ios-secondary font-medium uppercase tracking-tighter">{post.time}</p>
                  </div>
                </div>
                <button className="text-ios-secondary">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>

              {/* Post Image */}
              <div className="relative aspect-square overflow-hidden mx-2 rounded-2xl group">
                <img 
                  src={post.image} 
                  alt="" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/5 group-active:bg-black/10 transition-colors" />
              </div>

              {/* Interaction Bar */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex gap-5">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1.5 group"
                    >
                      <span className={`
                        material-symbols-outlined transition-all duration-300
                        ${post.isLiked ? 'text-ios-accent fill-1 animate-pop' : 'text-ios-secondary'}
                      `}>
                        favorite
                      </span>
                      <span className="text-xs font-bold text-ios-secondary">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-ios-secondary">
                      <span className="material-symbols-outlined">chat_bubble</span>
                      <span className="text-xs font-bold">{post.comments}</span>
                    </button>
                    <button className="text-ios-secondary">
                      <span className="material-symbols-outlined">send</span>
                    </button>
                  </div>
                  <button className="text-ios-secondary">
                    <span className="material-symbols-outlined">bookmark</span>
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <p className="text-[14px] text-ios-text dark:text-white/90 leading-relaxed font-medium">
                    {post.content}
                  </p>
                  <div className="flex gap-2">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-[11px] font-bold text-ios-accent bg-ios-accent/5 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Post Overlay */}
      {showCreatePost && (
        <div className="fixed inset-0 z-[100] bg-ios-bg dark:bg-dark-bg flex flex-col animate-fade-in">
          <header className="pt-16 pb-4 px-6 apple-blur bg-ios-blur dark:bg-dark-blur/80 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <button 
              onClick={() => { setShowCreatePost(false); setSelectedImage(null); }}
              className="text-ios-accent font-bold"
            >
              Cancel
            </button>
            <h2 className="text-lg font-extrabold dark:text-white">New Post</h2>
            <button 
              onClick={handleCreatePost}
              disabled={!newPostContent.trim() && !selectedImage}
              className={`font-bold transition-opacity ${(!newPostContent.trim() && !selectedImage) ? 'opacity-30 cursor-not-allowed' : 'text-ios-accent'}`}
            >
              Post
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Image Picker */}
            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <input 
                type="file" 
                accept="image/*" 
                hidden 
                ref={fileInputRef} 
                onChange={handleImageChange} 
              />
              {selectedImage ? (
                <div className="relative aspect-square rounded-ios overflow-hidden group">
                  <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full text-white shadow-xl active:scale-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square bg-white dark:bg-dark-card rounded-ios border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-3 active:scale-95 transition-all group hover:border-ios-accent"
                >
                  <div className="w-16 h-16 rounded-full bg-ios-bg dark:bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-ios-secondary text-3xl">add_a_photo</span>
                  </div>
                  <div className="text-center">
                    <p className="font-bold dark:text-white">Select Photo</p>
                    <p className="text-xs text-ios-secondary font-medium">Share your pet's moment</p>
                  </div>
                </button>
              )}
            </div>

            {/* Content Input */}
            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind? #PetJoy"
                className="w-full bg-transparent border-none text-xl font-medium dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-none resize-none min-h-[150px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
