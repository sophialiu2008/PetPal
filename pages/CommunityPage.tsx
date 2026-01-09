
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { translations, Language } from '../translations.ts';

interface Post {
  id: number;
  user: string;
  avatar: string;
  content: string;
  image: string;
  video?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  time: string;
}

const CommunityPage: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'For You' | 'Following'>('For You');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [waitingMsgIdx, setWaitingMsgIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      user: 'Max P.',
      avatar: 'https://i.pravatar.cc/150?u=max',
      content: 'Buster is having a blast at the park today! Samoyed energy is real. 🐕💨',
      image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=600',
      likes: 1240,
      comments: 45,
      isLiked: false,
      time: '2h ago'
    }
  ]);

  useEffect(() => {
    let timer: number;
    if (isGeneratingVideo) {
      timer = window.setInterval(() => {
        setWaitingMsgIdx(prev => (prev + 1) % t.waitingMessages.length);
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isGeneratingVideo, t.waitingMessages.length]);

  const handleAnimateImage = async () => {
    if (!selectedImage || isGeneratingVideo) return;

    // Veo Requirement: Check for API Key selection
    const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio?.openSelectKey();
    }

    setIsGeneratingVideo(true);
    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const base64Data = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onloadend = () => res((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
      });

      // Always create a fresh instance right before the call to ensure up-to-date key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      
      let operation;
      try {
        operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: 'A cute pet subtly wagging its tail and looking around happily, realistic movements, high quality, soft cinematic lighting',
          image: {
            imageBytes: base64Data,
            mimeType: 'image/jpeg',
          },
          config: { 
            numberOfVideos: 1, 
            resolution: '720p', 
            aspectRatio: '9:16'
          }
        });
      } catch (e: any) {
        // Robust handling for reported RPC 500 / XHR / Project errors
        const errorMsg = e.message || "";
        console.error("Veo API Error:", e);
        
        if (
          errorMsg.includes("Requested entity was not found") || 
          errorMsg.includes("Rpc failed") || 
          errorMsg.includes("500") ||
          errorMsg.includes("xhr error")
        ) {
          console.warn("API Error encountered (potentially project restriction). Prompting for key selection...");
          await (window as any).aistudio?.openSelectKey();
          throw new Error(language === 'en' 
            ? "Your API key might be missing billing or restricted. Please select a valid paid project key."
            : "您的 API 密钥可能未启用计费或受限。请选择一个有效的已付费项目密钥。");
        }
        throw e;
      }

      // Polling for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation failed: No output URI received.");

      // Fetch with the selected API key
      const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!videoResponse.ok) throw new Error("Failed to download generated video content.");
      
      const videoBlob = await videoResponse.blob();
      const videoUrl = URL.createObjectURL(videoBlob);
      
      setSelectedImage(null);
      const newPost: Post = {
        id: Date.now(),
        user: 'Alex Johnson',
        avatar: 'https://i.pravatar.cc/150?u=user123',
        content: newPostContent || 'Check out my pet in action! 🐾',
        image: selectedImage,
        video: videoUrl,
        likes: 0,
        comments: 0,
        isLiked: false,
        time: 'Just now'
      };
      setPosts([newPost, ...posts]);
      setShowCreatePost(false);
      setNewPostContent('');
    } catch (error: any) {
      console.error("Video generation failed:", error);
      alert(error.message || "Something went wrong. Please ensure you've selected a valid API key with billing enabled.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleLike = (id: number) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post
    ));
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  return (
    <div className="h-full bg-ios-bg dark:bg-dark-bg transition-colors flex flex-col relative">
      <header className="pt-16 pb-2 px-6 apple-blur bg-ios-blur dark:bg-dark-blur/80 sticky top-0 z-40">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold dark:text-white tracking-tight">{t.community}</h1>
          <button onClick={() => setShowCreatePost(true)} className="w-10 h-10 rounded-full bg-ios-accent text-white shadow-lg flex items-center justify-center active:scale-90 transition-all">
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
        </div>
        <div className="flex p-1 bg-gray-200/50 dark:bg-white/10 rounded-xl mb-4">
          {['For You', 'Following'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-white dark:bg-dark-card shadow-sm text-ios-text dark:text-white' : 'text-ios-secondary'}`}>
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-8 pb-32">
        {posts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-dark-card rounded-ios-lg overflow-hidden shadow-sm animate-slide-up">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={post.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div><h3 className="font-bold text-sm dark:text-white">{post.user}</h3><p className="text-[10px] text-ios-secondary uppercase">{post.time}</p></div>
              </div>
            </div>
            <div className={`relative ${post.video ? 'aspect-[9/16]' : 'aspect-square'} overflow-hidden mx-2 rounded-2xl bg-gray-100 dark:bg-black/20`}>
              {post.video ? (
                <video src={post.video} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              ) : (
                <img src={post.image} className="w-full h-full object-cover" alt="Post content" />
              )}
              {post.video && (
                <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] text-white font-black uppercase tracking-widest border border-white/10">
                  AI Video
                </div>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex gap-5">
                  <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 group">
                    <span className={`material-symbols-outlined transition-all ${post.isLiked ? 'text-ios-accent fill-1' : 'text-ios-secondary'}`}>favorite</span>
                    <span className="text-xs font-bold text-ios-secondary">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-ios-secondary"><span className="material-symbols-outlined">chat_bubble</span><span className="text-xs font-bold">{post.comments}</span></button>
                </div>
              </div>
              <p className="text-[14px] text-ios-text dark:text-white/90 leading-relaxed font-medium">{post.content}</p>
            </div>
          </div>
        ))}
      </div>

      {showCreatePost && (
        <div className="fixed inset-0 z-[100] bg-ios-bg dark:bg-dark-bg flex flex-col animate-fade-in">
          {isGeneratingVideo && (
            <div className="absolute inset-0 z-[110] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-12 space-y-10">
              <div className="relative">
                <div className="w-32 h-32 border-[6px] border-ios-accent/20 border-t-ios-accent rounded-full animate-spin shadow-2xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-ios-accent text-5xl animate-bounce">pets</span>
                </div>
              </div>
              <div className="space-y-4 max-w-xs">
                <h3 className="text-3xl font-black text-white tracking-tight">{t.generatingVideo}</h3>
                <p className="text-gray-400 font-bold italic h-12 flex items-center justify-center transition-all duration-1000">
                  {t.waitingMessages[waitingMsgIdx]}
                </p>
                <div className="pt-8">
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-ios-accent h-full animate-pulse" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <header className="pt-16 pb-4 px-6 apple-blur bg-ios-blur dark:bg-dark-blur/80 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <button onClick={() => setShowCreatePost(false)} className="text-ios-accent font-bold">Cancel</button>
            <h2 className="text-lg font-extrabold dark:text-white">New Post</h2>
            <button 
              onClick={() => {
                const newPost: Post = {
                  id: Date.now(), user: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=user123',
                  content: newPostContent, image: selectedImage!, likes: 0, comments: 0, isLiked: false, time: 'Just now'
                };
                setPosts([newPost, ...posts]);
                setShowCreatePost(false);
              }}
              disabled={!newPostContent.trim() || !selectedImage}
              className="text-ios-accent font-bold disabled:opacity-30"
            >Post</button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setSelectedImage(URL.createObjectURL(file));
            }} />
            
            {selectedImage ? (
              <div className="relative aspect-square rounded-ios overflow-hidden group shadow-2xl">
                <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute top-4 right-4 flex flex-col gap-3">
                   <button onClick={() => setSelectedImage(null)} className="bg-white/90 backdrop-blur-md p-2 rounded-full text-black shadow-lg hover:scale-110 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-sm">close</span>
                   </button>
                   <div className="flex flex-col gap-1 items-end">
                    <button 
                      onClick={handleAnimateImage}
                      className="bg-ios-accent p-3 rounded-full text-white shadow-2xl flex items-center gap-2 pr-5 hover:scale-105 active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-xl">auto_videocam</span>
                      <span className="text-xs font-black uppercase tracking-widest">{t.animate}</span>
                    </button>
                    <a 
                      href="https://ai.google.dev/gemini-api/docs/billing" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[8px] text-white/60 font-bold uppercase tracking-tighter underline pt-1 px-2"
                    >
                      Billing Info Required
                    </a>
                   </div>
                </div>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-square bg-white dark:bg-dark-card rounded-ios border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-4 transition-colors hover:border-ios-accent/40">
                <div className="w-16 h-16 rounded-full bg-ios-bg dark:bg-black/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-ios-accent text-3xl">add_a_photo</span>
                </div>
                <p className="font-bold dark:text-white">Select Photo to Animate</p>
              </button>
            )}
            <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="What's on your mind? Tell us about your pet's new moves..." className="w-full bg-transparent border-none text-xl font-medium dark:text-white outline-none resize-none min-h-[150px]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
