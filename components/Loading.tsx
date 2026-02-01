
import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full animate-pulse">
      <div className="netflix-spinner"></div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[#e50914]">Loading</p>
    </div>
  );
};

export default Loading;
