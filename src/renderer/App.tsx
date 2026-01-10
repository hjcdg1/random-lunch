import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import HistoryPage from './components/history/HistoryPage';
import NewAssignmentPage from './components/assignment/NewAssignmentPage';
import SettingsPage from './components/settings/SettingsPage';

type Page = 'history' | 'new' | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('history');

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="flex-1 overflow-auto scrollbar-hide">
          {currentPage === 'history' && <HistoryPage />}
          {currentPage === 'new' && <NewAssignmentPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </ThemeProvider>
  );
}
