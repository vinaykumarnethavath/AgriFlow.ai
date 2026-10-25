"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface DemoContextType {
  isDemoMode: boolean;
  demoRole: string | null;
  setDemoMode: (active: boolean, role?: string) => void;
  exitDemo: () => void;
}

const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  demoRole: null,
  setDemoMode: () => {},
  exitDemo: () => {},
});

export const DemoProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoRole, setDemoRole] = useState<string | null>(null);

  useEffect(() => {
    const checkDemo = () => {
      if (typeof window === "undefined") return;
      const demoFlag = localStorage.getItem("isDemoMode") === "true";
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const isDemo = demoFlag || Boolean(token?.startsWith("demo-token-")) || Boolean(userStr?.includes("demo@"));
      const role = localStorage.getItem("demoRole") || null;
      setIsDemoMode(isDemo);
      setDemoRole(role);
    };

    checkDemo();
    window.addEventListener("storage", checkDemo);
    return () => window.removeEventListener("storage", checkDemo);
  }, []);

  const setDemoMode = (active: boolean, role?: string) => {
    setIsDemoMode(active);
    setDemoRole(role || null);
    if (active) {
      localStorage.setItem("isDemoMode", "true");
      sessionStorage.setItem("demoMode", "true");
      if (role) {
        localStorage.setItem("demoRole", role);
        sessionStorage.setItem("demoRole", role);
      }
    } else {
      localStorage.removeItem("isDemoMode");
      localStorage.removeItem("demoRole");
      sessionStorage.removeItem("demoMode");
      sessionStorage.removeItem("demoRole");
    }
  };

  const exitDemo = () => {
    setDemoMode(false);
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, demoRole, setDemoMode, exitDemo }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemoMode = () => useContext(DemoContext);

