import { useSyncExternalStore, useMemo } from 'react';

let listeners: Set<() => void> = new Set();
let isInitialized = false;

function initializeHistoryWrap() {
  if (isInitialized) return;
  isInitialized = true;

  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;
  
  window.history.pushState = function(...args) {
    originalPushState.apply(this, args);
    listeners.forEach(listener => listener());
  };
  
  window.history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    listeners.forEach(listener => listener());
  };
  
  window.addEventListener('popstate', () => {
    listeners.forEach(listener => listener());
  });
}

function subscribe(callback: () => void) {
  initializeHistoryWrap();
  listeners.add(callback);
  
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot() {
  return window.location.search;
}

function getServerSnapshot() {
  return '';
}

export function useSearchParams() {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => new URLSearchParams(search), [search]);
}
