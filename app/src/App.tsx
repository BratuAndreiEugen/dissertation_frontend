import React from 'react';
import ReportDashboard from './components/ReportDashboard';

export default function App(): React.JSX.Element {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ReportDashboard />
    </div>
  );
}