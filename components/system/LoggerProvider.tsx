"use client";
import { useEffect } from "react";
import { installClientLogger } from "@/lib/logging/client-logger";

export default function LoggerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    installClientLogger();
  }, []);
  
  return <>{children}</>;
}