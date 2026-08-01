import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import type { SessionEvent } from "../types/event";

export type HandoffMethod = "calendar" | "share sheet" | "Files";

interface ScanSessionValue {
  events: SessionEvent[];
  skipped: Record<string, boolean>;
  selectMode: boolean;
  method: HandoffMethod | null;
  handoffDetail: string | null;
  selectedEvents: SessionEvent[];
  setEvents: (events: SessionEvent[]) => void;
  updateEvent: (id: string, patch: Partial<SessionEvent>) => void;
  toggleSkip: (id: string) => void;
  setSelectMode: (value: boolean) => void;
  setHandoff: (method: HandoffMethod, detail?: string) => void;
  reset: () => void;
}

const ScanSessionContext = createContext<ScanSessionValue | null>(null);

export function ScanSessionProvider({ children }: { children: React.ReactNode }) {
  const [events, setEventsState] = useState<SessionEvent[]>([]);
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});
  const [selectMode, setSelectMode] = useState(false);
  const [method, setMethod] = useState<HandoffMethod | null>(null);
  const [handoffDetail, setHandoffDetail] = useState<string | null>(null);

  const setEvents = useCallback((next: SessionEvent[]) => {
    setEventsState(next);
    setSkipped({});
    setSelectMode(false);
  }, []);

  const updateEvent = useCallback((id: string, patch: Partial<SessionEvent>) => {
    setEventsState((prev) => prev.map((event) => (event.id === id ? { ...event, ...patch } : event)));
  }, []);

  const toggleSkip = useCallback((id: string) => {
    setSkipped((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const setHandoff = useCallback((nextMethod: HandoffMethod, detail?: string) => {
    setMethod(nextMethod);
    setHandoffDetail(detail ?? null);
  }, []);

  const reset = useCallback(() => {
    setEventsState([]);
    setSkipped({});
    setSelectMode(false);
    setMethod(null);
    setHandoffDetail(null);
  }, []);

  const selectedEvents = useMemo(() => events.filter((event) => !skipped[event.id]), [events, skipped]);

  const value = useMemo(
    () => ({
      events,
      skipped,
      selectMode,
      method,
      handoffDetail,
      selectedEvents,
      setEvents,
      updateEvent,
      toggleSkip,
      setSelectMode,
      setHandoff,
      reset,
    }),
    [events, skipped, selectMode, method, handoffDetail, selectedEvents, setEvents, updateEvent, toggleSkip, setHandoff, reset]
  );

  return <ScanSessionContext.Provider value={value}>{children}</ScanSessionContext.Provider>;
}

export function useScanSession(): ScanSessionValue {
  const ctx = useContext(ScanSessionContext);
  if (!ctx) throw new Error("useScanSession must be used within a ScanSessionProvider");
  return ctx;
}
