'use client';

import { usePOSStore } from '@/lib/store';
import Sidebar from './Sidebar';
import Header from './Header';
import RegisterView from './views/RegisterView';
import InventoryView from './views/InventoryView';
import MembersView from './views/MembersView';
import TransactionsView from './views/TransactionsView';
import AnalyticsView from './views/AnalyticsView';
import StaffView from './views/StaffView';
import AIAssistantView from './views/AIAssistantView';
import SettingsView from './views/SettingsView';

export default function MainApp() {
  const currentView = usePOSStore(s => s.currentView);

  const renderView = () => {
    switch (currentView) {
      case 'register': return <RegisterView />;
      case 'inventory': return <InventoryView />;
      case 'members': return <MembersView />;
      case 'transactions': return <TransactionsView />;
      case 'analytics': return <AnalyticsView />;
      case 'staff': return <StaffView />;
      case 'ai_assistant': return <AIAssistantView />;
      case 'settings': return <SettingsView />;
      default: return <RegisterView />;
    }
  };

  return (
    <div className="h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}