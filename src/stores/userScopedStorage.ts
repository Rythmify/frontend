import { useAuthStore } from "@/stores/auth.store";

let storageScopeOverride: string | null = null;

function getActiveUserScope(): string {
  if (typeof window === "undefined") return "guest";

  if (storageScopeOverride) return storageScopeOverride;

  const user = useAuthStore.getState().user;
  return user?.id || user?.username || "guest";
}

export function setUserScopedStorageOverride(scope: string | null) {
  storageScopeOverride = scope;
}

export function createUserScopedStorage(prefix: string) {
  return {
    getItem: (name: string) => {
      if (typeof window === "undefined") return null;
      const key = `${prefix}:${getActiveUserScope()}:${name}`;
      return window.localStorage.getItem(key);
    },
    setItem: (name: string, value: string) => {
      if (typeof window === "undefined") return;
      const key = `${prefix}:${getActiveUserScope()}:${name}`;
      window.localStorage.setItem(key, value);
    },
    removeItem: (name: string) => {
      if (typeof window === "undefined") return;
      const key = `${prefix}:${getActiveUserScope()}:${name}`;
      window.localStorage.removeItem(key);
    },
  };
}

export function getActiveUserScopeKey() {
  return getActiveUserScope();
}
