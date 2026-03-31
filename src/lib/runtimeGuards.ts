type MgtCompat = {
  clearMarks?: () => void;
};

declare global {
  interface Window {
    mgt?: MgtCompat;
  }

  interface globalThis {
    mgt?: MgtCompat;
  }
}

function getMgtHost(): typeof globalThis | undefined {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }

  if (typeof window !== "undefined") {
    return window;
  }

  return undefined;
}

/**
 * Compat shim for external scripts/extensions that call window.mgt.clearMarks().
 * The app does not use this API, but providing a no-op prevents runtime crashes.
 */
export function ensureLegacyMgtCompat(): void {
  const host = getMgtHost();

  if (!host) {
    return;
  }

  const currentMgt = host.mgt ?? {};

  if (typeof currentMgt.clearMarks !== "function") {
    currentMgt.clearMarks = () => {
      // Intentionally no-op: only protects against missing external API.
    };
  }

  host.mgt = currentMgt;

  if (typeof window !== "undefined") {
    window.mgt = currentMgt;
  }
}
