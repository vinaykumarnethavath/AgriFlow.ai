"use client";

import React, { createContext, useContext, useState } from "react";

interface DemoContextType {
  isDemoMode: boolean;
  demoRole: string | null;
  setDemoMode: (active: boolean, role?: string) => void;
}

const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  demoRole: null,
  setDemoMode: () => {},
});

export const DemoProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoRole, setDemoRole] = useState<string | null>(null);

  const setDemoMode = (active: boolean, role?: string) => {
    setIsDemoMode(active);
    setDemoRole(role || null);
    if (active && role) {
      sessionStorage.setItem("demoMode", "true");
      sessionStorage.setItem("demoRole", role);
    } else {
      sessionStorage.removeItem("demoMode");
      sessionStorage.removeItem("demoRole");
    }
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, demoRole, setDemoMode }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemoMode = () => useContext(DemoContext);
