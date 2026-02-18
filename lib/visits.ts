export interface Visit {
  id: string;
  date: string;
  templateName: string;
  patientName?: string;
  patientDob?: string;
  note: string;
  transcript: string;
}

const STORAGE_KEY = "ent-scribe-visits";
const MAX_VISITS = 50;

export function getVisits(): Visit[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveVisit(visit: Omit<Visit, "id" | "date">): Visit {
  const newVisit: Visit = {
    ...visit,
    id: `visit-${Date.now()}`,
    date: new Date().toISOString(),
  };
  const visits = getVisits();
  visits.unshift(newVisit);
  // Keep only the most recent MAX_VISITS
  if (visits.length > MAX_VISITS) visits.splice(MAX_VISITS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
  return newVisit;
}

export function deleteVisit(id: string): void {
  const visits = getVisits().filter((v) => v.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
}

export function clearVisits(): void {
  localStorage.removeItem(STORAGE_KEY);
}
