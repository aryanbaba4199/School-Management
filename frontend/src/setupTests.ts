import '@testing-library/jest-dom';

// Polyfill localStorage if it is missing or incomplete in the test environment
if (typeof window !== 'undefined') {
  let store: Record<string, string> = {};
  
  const mockLocalStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() {
      return Object.keys(store).length;
    }
  };

  if (!window.localStorage || typeof window.localStorage.clear !== 'function') {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true
    });
  }

  if (typeof globalThis !== 'undefined' && (!globalThis.localStorage || typeof globalThis.localStorage.clear !== 'function')) {
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true
    });
  }
}
