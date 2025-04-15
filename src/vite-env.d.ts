
/// <reference types="vite/client" />

interface Window {
  metaApiCalls: any[];
  dispatchEvent(event: Event | CustomEvent): boolean;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}
