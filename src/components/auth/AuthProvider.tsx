'use client';

import { useState, createContext, useContext } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthModal } from './AuthModal';

interface AuthModalContextValue {
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue>({
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function useAuthModal() {
  return useContext(AuthModalContext);
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<'login' | 'register'>('login');

  function openAuthModal(tab: 'login' | 'register' = 'login') {
    setDefaultTab(tab);
    setIsOpen(true);
  }

  function closeAuthModal() {
    setIsOpen(false);
  }

  return (
    <SessionProvider>
      <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
        {children}
        <AuthModal
          open={isOpen}
          onOpenChange={setIsOpen}
          defaultTab={defaultTab}
        />
      </AuthModalContext.Provider>
    </SessionProvider>
  );
}
