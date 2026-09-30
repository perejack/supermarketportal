import { useEffect, useState, useCallback } from "react";
import type { Employer } from "./brands";

export interface StaffUser {
  fullName: string;
  staffNumber: string;
  position: string;
  employer: Employer;
  branch: string;
}

export interface Onboarding {
  photoDataUrl?: string;
  idFrontDataUrl?: string;
  idFrontPath?: string;
  idBackDataUrl?: string;
  idBackPath?: string;
  uniformSize?: "S" | "M" | "L" | "XL";
  uniformTypes?: ("shirt" | "polo" | "apron")[];
  badgeNameMode?: "first" | "full";
  lockerRequested?: boolean;
  lockerKeys?: number;
  trainingAccepted?: boolean;
  trainingReviewed?: boolean;
  badgeSubmitted?: boolean;
  contractDownloaded?: boolean;
  // Payment
  paymentCompleted?: boolean;
  paymentRef?: string; // M-Pesa receipt number
  paymentPhone?: string;
  paymentAt?: string; // ISO
  paymentAmount?: number;
}

const USER_KEY = "staffhub.user";
const ONB_KEY = "staffhub.onb";

// Clear persisted data on page refresh/reload so previous states do not linger
if (typeof window !== "undefined") {
  try {
    const navEntries = performance.getEntriesByType("navigation");
    const isReload =
      (navEntries.length > 0 && (navEntries[0] as PerformanceNavigationTiming).type === "reload") ||
      (window.performance as any)?.navigation?.type === 1;

    if (isReload) {
      sessionStorage.clear();
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(ONB_KEY);
    }
  } catch {
    // ignore
  }
}

export function clearAllData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ONB_KEY);
  sessionStorage.clear();
  window.dispatchEvent(new Event("staffhub:user"));
  window.dispatchEvent(new Event("staffhub:onb"));
}

export function clearPaymentData() {
  if (typeof window === "undefined") return;
  const onb = loadOnb();
  const next = {
    ...onb,
    paymentCompleted: false,
    paymentRef: undefined,
    paymentPhone: undefined,
    paymentAt: undefined,
  };
  saveOnb(next);
  return next;
}

export async function syncApplicationToBackend(u?: StaffUser | null, o?: Onboarding | null) {
  if (typeof window === "undefined") return null;
  const user = u !== undefined ? u : loadUser();
  const onb = o !== undefined ? o : loadOnb();
  if (!user?.fullName || !user?.staffNumber || !user?.employer || !user?.position) {
    return null;
  }
  try {
    const res = await fetch("/api/applications/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, onb }),
    });
    return (await res.json().catch(() => null)) as { ok: boolean; applicationId?: string } | null;
  } catch (err) {
    console.error("Auto-sync application error:", err);
    return null;
  }
}

export function loadUser(): StaffUser | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; }
}
export function saveUser(u: StaffUser | null) {
  if (typeof window === "undefined") return;
  if (u) {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    // Clear old onboarding and payment data when starting with a user so they start fresh
    localStorage.removeItem(ONB_KEY);
    window.dispatchEvent(new Event("staffhub:onb"));
    syncApplicationToBackend(u, {}).catch(() => null);
  } else {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ONB_KEY);
    window.dispatchEvent(new Event("staffhub:onb"));
  }
  window.dispatchEvent(new Event("staffhub:user"));
}
export function loadOnb(): Onboarding {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(ONB_KEY) || "{}"); } catch { return {}; }
}
export function saveOnb(o: Onboarding) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ONB_KEY, JSON.stringify(o));
    window.dispatchEvent(new Event("staffhub:onb"));
    syncApplicationToBackend(loadUser(), o).catch(() => null);
  } catch (error) {
    console.error("Failed to save onboarding data", error);
    throw error;
  }
}

export function useUser() {
  const [u, setU] = useState<StaffUser | null | undefined>(undefined);
  useEffect(() => {
    setU(loadUser());
    const h = () => setU(loadUser());
    window.addEventListener("staffhub:user", h);
    return () => window.removeEventListener("staffhub:user", h);
  }, []);
  return u;
}

export function useOnb(): [Onboarding, (patch: Partial<Onboarding>) => void] {
  const [o, setO] = useState<Onboarding>({});
  useEffect(() => {
    setO(loadOnb());
    const h = () => setO(loadOnb());
    window.addEventListener("staffhub:onb", h);
    return () => window.removeEventListener("staffhub:onb", h);
  }, []);
  const patch = useCallback((p: Partial<Onboarding>) => {
    const next = { ...loadOnb(), ...p };
    saveOnb(next);
    setO(next);
  }, []);
  return [o, patch];
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

async function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function compressImageDataUrl(dataUrl: string): Promise<string> {
  try {
    const img = await loadImageElement(dataUrl);
    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;

    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } catch {
    return dataUrl;
  }
}

export async function fileToDataUrl(file: File): Promise<string> {
  const raw = await readFileAsDataUrl(file);
  if (!file.type.startsWith("image/")) return raw;
  return compressImageDataUrl(raw);
}
