import React from 'react';
import ReportDashboard from './components/ReportDashboard';
import ExpandableImageBanner from './components/ExpandableImageBanner';

export default function App(): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px',
        height: '60px',
        minHeight: '60px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #cbd5e1',
        zIndex: 1001,
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Serverless Benchmark v1.0
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          <ExpandableImageBanner 
            imageSrc="/legend.png" 
            title="Metrics Legend"
          />

          <a
            href="https://github.com/BratuAndreiEugen/Dissertation_Thesis_Code"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#334155',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'background-color 0.2s, borderColor 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <img 
              src="/github-icon.png" 
              alt="GitHub" 
              style={{ width: '20px', height: '20px' }} 
            />
            Source Code
          </a>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <ReportDashboard />
      </div>

    </div>
  );
}