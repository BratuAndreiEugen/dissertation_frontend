import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface ReportMetadata {
  id: string;
  filename: string;
  provider: string;
  workspace: string;
  test_type: string;
}

export default function ReportDashboard(): React.JSX.Element {
  const [reports, setReports] = useState<ReportMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [activePane, setActivePane] = useState<'left' | 'right'>('left');

  const [leftReport, setLeftReport] = useState<ReportMetadata | null>(null);
  const [rightReport, setRightReport] = useState<ReportMetadata | null>(null);

  const [leftContent, setLeftContent] = useState<string>('');
  const [rightContent, setRightContent] = useState<string>('');

  const [loadingLeft, setLoadingLeft] = useState<boolean>(false);
  const [loadingRight, setLoadingRight] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getReportUrl = (report: ReportMetadata) => {
    const workspacePath = report.workspace.toLowerCase().replaceAll('-', '_');
    const providerPath = report.provider.toLowerCase();
    return `/reports/${workspacePath}/${providerPath}/${report.filename}`;
  };

  useEffect(() => {
    fetch('/reports/index.json')
      .then((res) => res.json())
      .then((data: ReportMetadata[]) => {
        setReports(data);
        if (data.length > 0) {
          setLeftReport(data[0]);
          if (data.length > 1) setRightReport(data[1]);
        }
      })
      .catch((err) => console.error("Error loading report index:", err));
  }, []);

  useEffect(() => {
    if (!leftReport) return;
    setLoadingLeft(true);
    fetch(getReportUrl(leftReport))
      .then((res) => res.text())
      .then((text) => {
        setLeftContent(text);
        setLoadingLeft(false);
      })
      .catch((err) => {
        console.error(err);
        setLeftContent("# Error\nCould not fetch left report context.");
        setLoadingLeft(false);
      });
  }, [leftReport]);

  useEffect(() => {
    if (!rightReport) return;
    setLoadingRight(true);
    fetch(getReportUrl(rightReport))
      .then((res) => res.text())
      .then((text) => {
        setRightContent(text);
        setLoadingRight(false);
      })
      .catch((err) => {
        console.error(err);
        setRightContent("# Error\nCould not fetch right report context.");
        setLoadingRight(false);
      });
  }, [rightReport]);

  const handleReportSelect = (report: ReportMetadata) => {
    if (!compareMode) {
      setLeftReport(report);
    } else {
      if (activePane === 'left') {
        setLeftReport(report);
      } else {
        setRightReport(report);
      }
    }
    
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const query = searchTerm.toLowerCase();
    return (
      report.id.toLowerCase().includes(query) ||
      report.provider.toLowerCase().includes(query) ||
      report.workspace.toLowerCase().includes(query)
    );
  });

  const markdownComponents = {
    img: ({ src, alt, ...props }: any) => {
      let cleanSrc = src || '';
      if (cleanSrc.includes('../../images/')) {
        const filename = cleanSrc.split('../../images/')[1];
        cleanSrc = `/reports/images/${filename}`;
      }
      return (
        <img
          src={cleanSrc}
          alt={alt || "Telemetry Graph"}
          style={{
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            margin: '20px 0',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          {...props}
        />
      );
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', overflow: 'hidden', position: 'relative' }}>
      
      {sidebarOpen && window.innerWidth <= 768 && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 998, transition: 'opacity 0.2s'
          }}
        />
      )}

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'absolute', top: '15px', left: sidebarOpen && window.innerWidth > 768 ? '365px' : '15px',
          zIndex: 1000, padding: '10px 14px', backgroundColor: '#0070f3', color: '#fff',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {sidebarOpen ? '✕ Hide List' : '☰ Show Reports'}
      </button>

      <div style={{ 
        width: '350px', 
        minWidth: '350px',
        borderRight: '1px solid #ddd', 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: '#f9f9f9', 
        height: '100%',
        marginLeft: sidebarOpen ? '0' : '-350px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: window.innerWidth <= 768 ? 'absolute' : 'relative',
        zIndex: 999
      }}>
        
        <div style={{ padding: '15px', borderBottom: '1px solid #ddd', backgroundColor: '#fff', paddingTop: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '10px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input 
                type="checkbox" 
                checked={compareMode} 
                onChange={(e) => {
                  setCompareMode(e.target.checked);
                  if (e.target.checked) setActivePane('left'); 
                }}
              />
              Split Comparison Mode
            </label>
          </div>

          {compareMode && (
            <div style={{ display: 'flex', gap: '5px', marginBottom: '12px' }}>
              <button 
                onClick={() => setActivePane('left')}
                style={{
                  flex: 1, padding: '6px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc',
                  backgroundColor: activePane === 'left' ? '#0070f3' : '#fff',
                  color: activePane === 'left' ? '#fff' : '#000',
                  fontWeight: activePane === 'left' ? 'bold' : 'normal'
                }}
              >
                ◀ Assign Left
              </button>
              <button 
                onClick={() => setActivePane('right')}
                style={{
                  flex: 1, padding: '6px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc',
                  backgroundColor: activePane === 'right' ? '#0070f3' : '#fff',
                  color: activePane === 'right' ? '#fff' : '#000',
                  fontWeight: activePane === 'right' ? 'bold' : 'normal'
                }}
              >
                Assign Right ▶
              </button>
            </div>
          )}

          <input
            type="text"
            placeholder="Search by ID, provider, workspace..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
            Showing {filteredReports.length} of {reports.length} reports
          </small>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredReports.map((report) => {
            const isLeft = leftReport?.id === report.id;
            const isRight = rightReport?.id === report.id;

            let bgStyle = 'transparent';
            if (compareMode) {
              if (isLeft && isRight) bgStyle = '#e2f0d9';
              else if (isLeft) bgStyle = '#e0f3ff';
              else if (isRight) bgStyle = '#fef3c7';
            } else if (isLeft) {
              bgStyle = '#e0f3ff';
            }

            return (
              <div
                key={report.id}
                onClick={() => handleReportSelect(report)}
                style={{
                  padding: '12px 15px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  backgroundColor: bgStyle,
                  transition: 'background-color 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#333' }}>{report.id}</div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px', fontSize: '12px' }}>
                  <span style={{ backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                    ⚙️ {report.provider.toUpperCase()}
                  </span>
                  <span style={{ backgroundColor: '#edf2f7', padding: '2px 6px', borderRadius: '4px', color: '#4a5568' }}>
                    📁 {report.workspace}
                  </span>
                </div>
                {compareMode && (
                  <div style={{ position: 'absolute', right: '10px', top: '12px', fontSize: '10px', display: 'flex', gap: '2px' }}>
                    {isLeft && <span style={{ backgroundColor: '#0070f3', color: '#fff', padding: '2px 4px', borderRadius: '3px' }}>L</span>}
                    {isRight && <span style={{ backgroundColor: '#d97706', color: '#fff', padding: '2px 4px', borderRadius: '3px' }}>R</span>}
                  </div>
                )}
              </div>
            );
          })}
          {filteredReports.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No reports match your filter criteria.</div>
          )}
        </div>
      </div>

      <div style={{ 
        flex: 1, 
        display: 'flex', 
        overflow: 'hidden', 
        backgroundColor: '#fff',
        flexDirection: window.innerWidth <= 992 ? 'column' : 'row'
      }}>
        
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '30px', 
          paddingTop: '80px',
          borderRight: compareMode && window.innerWidth > 992 ? '2px solid #cbd5e1' : 'none',
          borderBottom: compareMode && window.innerWidth <= 992 ? '2px solid #cbd5e1' : 'none',
          backgroundColor: compareMode && activePane === 'left' ? '#fafafa' : '#fff'
        }}>
          {loadingLeft ? (
            <div style={{ color: '#666', fontSize: '16px' }}>Loading left performance telemetry...</div>
          ) : (
            <div className="markdown-body" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                {leftContent}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {compareMode && (
          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '30px',
            paddingTop: window.innerWidth <= 992 ? '30px' : '80px',
            backgroundColor: activePane === 'right' ? '#fafafa' : '#fff'
          }}>
            {loadingRight ? (
              <div style={{ color: '#666', fontSize: '16px' }}>Loading right performance telemetry...</div>
            ) : (
              <div className="markdown-body" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                  {rightContent}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}