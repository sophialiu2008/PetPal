
import React from 'react';

interface Props {
  visible: boolean;
  message: string;
}

const DynamicIsland: React.FC<Props> = ({ visible, message }) => {
  return (
    <div className="absolute top-2 left-0 right-0 flex justify-center z-[100] pointer-events-none">
      <div 
        className={`
          bg-black text-white h-10 flex items-center justify-center px-6 rounded-full
          transition-all duration-500 ease-in-out transform
          ${visible ? 'w-64 opacity-100 translate-y-2 scale-100' : 'w-24 opacity-0 translate-y-0 scale-95'}
        `}
      >
        <span className={`text-xs font-bold transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          {message}
        </span>
      </div>
    </div>
  );
};

export default DynamicIsland;
