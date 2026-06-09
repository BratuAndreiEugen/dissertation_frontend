import React, { useState, useRef, useEffect } from 'react';

interface ExpandableImageBannerProps {
  imageSrc?: string;
  title?: string;
}

export default function ExpandableImageBanner({
  imageSrc = "/legend.png",
  title = "View Legend"
}: ExpandableImageBannerProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 20px', 
          minWidth: '180px',    
          backgroundColor: isExpanded ? '#f1f5f9' : '#f8fafc',
          border: '1px solid',
          borderColor: isExpanded ? '#cbd5e1' : '#e2e8f0',
          color: '#334155',
          borderRadius: '6px',
          fontWeight: '600',
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseOver={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }
        }}
        onMouseOut={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }
        }}
      >
        <span style={{ flex: 1, textAlign: 'left' }}>{title}</span>
        <span style={{ 
          fontSize: '10px', 
          color: '#64748b', 
          transition: 'transform 0.2s', 
          transform: isExpanded ? 'rotate(180deg)' : 'none' 
        }}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div style={{ 
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0, 
          width: '800px',
          maxWidth: '90vw',
          maxHeight: 'calc(100vh - 80px)',
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.15), 0 15px 20px -10px rgba(0, 0, 0, 0.15)',
          zIndex: 2000,
          padding: '12px',
          overflowY: 'auto'
        }}>
          <div style={{ width: '100%' }}>
            <img 
              src={imageSrc} 
              alt="Dashboard Visual Guide" 
              style={{ 
                display: 'block',
                width: '100%',
                height: 'auto',
                borderRadius: '4px'
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}