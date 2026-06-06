import React, { useState, useEffect, useRef } from 'react';

interface ReportMetadata {
  id: string;
  filename: string;
  provider: string;
  workspace: string;
  test_type: string;
}

interface CsvViewerProps {
  report: ReportMetadata | null;
}

export default function CsvDataViewer({ report }: CsvViewerProps): React.JSX.Element | null {
  const [isExpanded, setIsExpanded] = useState(false);
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableWidth, setTableWidth] = useState<number>(0);

  const topScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    setIsExpanded(false);
    setCsvData(null);
    setError(null);
  }, [report]);

  useEffect(() => {
    if (!isExpanded || !tableRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setTableWidth(entry.target.scrollWidth);
      }
    });

    observer.observe(tableRef.current);
    return () => observer.disconnect();
  }, [isExpanded, csvData]);

  if (!report) return null;

  const handleToggle = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    if (newExpandedState && !csvData && !loading) {
      fetchCsv();
    }
  };

  const fetchCsv = async () => {
    setLoading(true);
    setError(null);
    try {
      const workspacePath = report.workspace.toLowerCase().replaceAll('-', '_');
      const providerPath = report.provider.toLowerCase();
      const csvFilename = report.filename.replace('_report.md', '.csv');
      const url = `/reports/${workspacePath}/${providerPath}/${csvFilename}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const text = await response.text();
      
      const rows = text
        .trim()
        .split('\n')
        .map(line => line.split(',').map(cell => cell.trim()));
        
      setCsvData(rows);
    } catch (err) {
      console.error("Error loading CSV:", err);
      setError('Could not load CSV telemetry data.');
    } finally {
      setLoading(false);
    }
  };

  const handleTopScroll = () => {
    if (bottomScrollRef.current && topScrollRef.current) {
      bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const handleBottomScroll = () => {
    if (topScrollRef.current && bottomScrollRef.current) {
      topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft;
    }
  };

  return (
    <div style={{ marginTop: '30px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
      <button
        onClick={handleToggle}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: '#f8fafc',
          border: 'none',
          borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
          textAlign: 'left',
          fontWeight: 'bold',
          color: '#334155',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
      >
        <span>Raw Data (CSV)</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div style={{ backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
          {loading && <div style={{ padding: '16px', color: '#64748b' }}>Loading CSV data...</div>}
          {error && <div style={{ padding: '16px', color: '#ef4444' }}>{error}</div>}
          
          {csvData && csvData.length > 0 && (
            <>
              <div 
                ref={topScrollRef} 
                onScroll={handleTopScroll}
                style={{ overflowX: 'auto', width: '100%', borderBottom: '1px solid #e2e8f0' }}
              >
                <div style={{ width: `${tableWidth}px`, height: '1px' }}></div>
              </div>

              <div 
                ref={bottomScrollRef} 
                onScroll={handleBottomScroll}
                style={{ overflowX: 'auto', width: '100%' }}
              >
                <table ref={tableRef} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#f1f5f9' }}>
                    <tr>
                      {csvData[0]?.map((header, i) => (
                        <th key={i} style={{ borderBottom: '2px solid #cbd5e1', padding: '10px 16px', color: '#334155', fontWeight: '600', whiteSpace: 'nowrap' }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(1).map((row, rowIndex) => (
                      <tr key={rowIndex} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} style={{ padding: '10px 16px', color: '#475569', whiteSpace: 'nowrap' }}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}