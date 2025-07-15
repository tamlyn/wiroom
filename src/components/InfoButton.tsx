import { useState } from 'react';

interface InfoButtonProps {
  content: React.ReactNode;
  className?: string;
}

export const InfoButton = ({ content, className = "" }: InfoButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center hover:bg-blue-600 transition-colors"
        aria-label="More information"
      >
        i
      </button>
      {isVisible && (
        <div className="absolute z-10 w-64 p-2 mt-1 text-xs bg-gray-900 text-white rounded shadow-lg -left-32 transform">
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          {content}
        </div>
      )}
    </div>
  );
};