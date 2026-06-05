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
  idBackDataUrl?: string;
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

export function loadUser(): StaffUser | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; }
}
export function saveUser(u: StaffUser | null) {
  if (typeof window === "undefined") return;
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("staffhub:user"));
}
export function loadOnb(): Onboarding {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(ONB_KEY) || "{}"); } catch { return {}; }
}
export function saveOnb(o: Onboarding) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONB_KEY, JSON.stringify(o));
  window.dispatchEvent(new Event("staffhub:onb"));
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

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
