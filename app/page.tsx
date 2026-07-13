'use client';

import { usePOSStore } from '@/lib/store';
import { useEffect } from 'react';
import LoginScreen from '@/components/LoginScreen';
import MainApp from '@/components/MainApp';

export default function HomePage() {
  const initialize = usePOSStore(s => s.initialize);
  const currentStaff = usePOSStore(s => s.currentStaff);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return currentStaff ? <MainApp /> : <LoginScreen />;
}